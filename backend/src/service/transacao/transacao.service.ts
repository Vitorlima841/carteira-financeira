import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';
import { EntityManager } from 'typeorm';
import { Conta } from '../../model/conta/conta.entity';
import { ContaNaoEncontradaError } from '../../model/conta/error/conta-nao-encontrada.error';
import { DirecaoLancamento } from '../../model/lancamento/enum/direcao-lancamento.enum';
import { Lancamento } from '../../model/lancamento/lancamento.entity';
import { CriarDepositoDto } from '../../model/transacao/DTO/criar-deposito.dto';
import { CriarTransferenciaDto } from '../../model/transacao/DTO/criar-transferencia.dto';
import { FiltroTransacaoDto } from '../../model/transacao/DTO/filtro-transacao.dto';
import { StatusTransacao } from '../../model/transacao/enum/status-transacao.enum';
import { TipoTransacao } from '../../model/transacao/enum/tipo-transacao.enum';
import { AcessoNegadoError } from '../../model/transacao/error/acesso-negado.error';
import { SaldoInsuficienteError } from '../../model/transacao/error/saldo-insuficiente.error';
import { TransacaoNaoEncontradaError } from '../../model/transacao/error/transacao-nao-encontrada.error';
import { TransacaoNaoReversivelError } from '../../model/transacao/error/transacao-nao-reversivel.error';
import { TransferenciaParaMesmaContaError } from '../../model/transacao/error/transferencia-para-mesma-conta.error';
import { ValorInvalidoError } from '../../model/transacao/error/valor-invalido.error';
import { DadosLancamentoDuplo } from '../../model/transacao/interface/dados-lancamento-duplo.interface';
import { TransacaoDetalhada } from '../../model/transacao/interface/transacao-detalhada.interface';
import { Transacao } from '../../model/transacao/transacao.entity';
import { UsuarioNaoEncontradoError } from '../../model/usuario/error/usuario-nao-encontrado.error';
import { ContaRepositorioTypeOrm } from '../../repository/conta.repository';
import { LancamentoRepositorioTypeOrm } from '../../repository/lancamento.repository';
import { TransacaoRepositorioTypeOrm } from '../../repository/transacao.repository';
import { UsuarioRepositorioTypeOrm } from '../../repository/usuario.repository';
import { UnidadeTrabalhoService } from '../../shared/database/unidade-trabalho.service';
import { ConstantUtils } from '../../shared/utils/constant.utils';
import { ContaService } from '../conta/conta.service';

@Injectable()
export class TransacaoService {
  constructor(
    private readonly transacaoRepositorio: TransacaoRepositorioTypeOrm,
    private readonly lancamentoRepositorio: LancamentoRepositorioTypeOrm,
    private readonly contaRepositorio: ContaRepositorioTypeOrm,
    private readonly usuarioRepositorio: UsuarioRepositorioTypeOrm,
    private readonly contaService: ContaService,
    private readonly unidadeTrabalho: UnidadeTrabalhoService,
  ) {}

  async depositar(usuarioId: string, dados: CriarDepositoDto): Promise<Transacao> {
    const valor = this.converterValor(dados.valor);

    return this.unidadeTrabalho.executar(async (manager) => {
      const conta = await this.contaService.obterPorUsuarioId(usuarioId, manager);

      return this.registrarLancamentoDuplo(manager, {
        tipo: TipoTransacao.DEPOSITO,
        contaDestinoId: conta.id,
        valor,
      });
    });
  }

  async transferir(usuarioId: string, dados: CriarTransferenciaDto): Promise<Transacao> {
    const valor = this.converterValor(dados.valor);

    return this.unidadeTrabalho.executar(async (manager) => {
      const contaOrigem = await this.contaService.obterPorUsuarioId(usuarioId, manager);

      const destinatario = await this.usuarioRepositorio.buscarPorEmail(dados.emailDestinatario, manager);
      if (!destinatario) {
        throw new UsuarioNaoEncontradoError();
      }

      const contaDestino = await this.contaService.obterPorUsuarioId(destinatario.id, manager);
      if (contaDestino.id === contaOrigem.id) {
        throw new TransferenciaParaMesmaContaError();
      }

      return this.registrarLancamentoDuplo(manager, {
        tipo: TipoTransacao.TRANSFERENCIA,
        contaOrigemId: contaOrigem.id,
        contaDestinoId: contaDestino.id,
        valor,
      });
    });
  }

  async listarExtrato(usuarioId: string, filtro: FiltroTransacaoDto): Promise<[Transacao[], number]> {
    const conta = await this.contaService.obterPorUsuarioId(usuarioId);
    return this.transacaoRepositorio.listarPorConta(conta.id, filtro);
  }

  async obterPorId(usuarioId: string, transacaoId: string): Promise<TransacaoDetalhada> {
    const conta = await this.contaService.obterPorUsuarioId(usuarioId);

    const transacao = await this.transacaoRepositorio.buscarPorId(transacaoId);
    if (!transacao) {
      throw new TransacaoNaoEncontradaError();
    }
    this.garantirParticipacao(transacao, conta.id);

    const lancamentos = await this.lancamentoRepositorio.listarPorTransacaoId(transacao.id);
    return { transacao, lancamentos };
  }

  async estornar(usuarioId: string, transacaoId: string): Promise<Transacao> {
    return this.unidadeTrabalho.executar(async (manager) => {
      const conta = await this.contaService.obterPorUsuarioId(usuarioId, manager);

      const original = await this.transacaoRepositorio.bloquearPorId(transacaoId, manager);
      if (!original) {
        throw new TransacaoNaoEncontradaError();
      }

      this.garantirParticipacao(original, conta.id);
      this.garantirReversibilidade(original);

      const estorno = await this.registrarLancamentoDuplo(manager, {
        tipo: TipoTransacao.ESTORNO,
        contaOrigemId: original.contaDestinoId ?? undefined,
        contaDestinoId: original.contaOrigemId ?? undefined,
        valor: new Decimal(original.valor),
        transacaoEstornadaId: original.id,
      });

      original.status = StatusTransacao.ESTORNADA;
      await this.transacaoRepositorio.salvar(original, manager);

      return estorno;
    });
  }

  /**
   * Núcleo do livro-razão: bloqueia as contas envolvidas, valida a operação e persiste a
   * transação com seus lançamentos (1 no depósito, 2 na transferência/estorno), mantendo o
   * saldoCache das contas em dia. Tudo no mesmo EntityManager, portanto commit tudo ou nada.
   */
  private async registrarLancamentoDuplo(manager: EntityManager, dados: DadosLancamentoDuplo): Promise<Transacao> {
    if (!dados.valor.isFinite() || dados.valor.lessThanOrEqualTo(0)) {
      throw new ValorInvalidoError(dados.valor.toString());
    }

    const contasBloqueadas = await this.bloquearContas(manager, [dados.contaOrigemId, dados.contaDestinoId]);
    const valorFormatado = dados.valor.toFixed(ConstantUtils.ESCALA_MONETARIA);

    // O estorno é a única operação que pode deixar a conta negativa: o destinatário original
    // pode já ter gasto o valor recebido, e ainda assim a devolução precisa acontecer.
    if (dados.contaOrigemId && dados.tipo !== TipoTransacao.ESTORNO) {
      const saldoOrigem = new Decimal(this.obterConta(contasBloqueadas, dados.contaOrigemId).saldoCache);
      if (saldoOrigem.lessThan(dados.valor)) {
        throw new SaldoInsuficienteError(saldoOrigem.toFixed(ConstantUtils.ESCALA_MONETARIA), valorFormatado);
      }
    }

    const agora = new Date();
    const transacao = new Transacao();

    transacao.id = randomUUID();
    transacao.tipo = dados.tipo;
    transacao.status = StatusTransacao.CONCLUIDA;
    transacao.valor = valorFormatado;
    transacao.contaOrigemId = dados.contaOrigemId ?? null;
    transacao.contaDestinoId = dados.contaDestinoId ?? null;
    transacao.transacaoEstornadaId = dados.transacaoEstornadaId ?? null;
    transacao.metadados = {};
    transacao.criadoEm = agora;
    transacao.atualizadoEm = agora;

    await this.transacaoRepositorio.salvar(transacao, manager);

    if (dados.contaOrigemId) {
      await this.registrarLancamento(manager, transacao, this.obterConta(contasBloqueadas, dados.contaOrigemId), DirecaoLancamento.DEBITO, dados.valor);
    }

    if (dados.contaDestinoId) {
      await this.registrarLancamento(manager, transacao, this.obterConta(contasBloqueadas, dados.contaDestinoId), DirecaoLancamento.CREDITO, dados.valor);
    }

    return transacao;
  }

  private async registrarLancamento(manager: EntityManager, transacao: Transacao, conta: Conta, direcao: DirecaoLancamento, valor: Decimal): Promise<void> {
    const lancamento = new Lancamento();

    lancamento.id = randomUUID();
    lancamento.transacaoId = transacao.id;
    lancamento.contaId = conta.id;
    lancamento.direcao = direcao;
    lancamento.valor = valor.toFixed(ConstantUtils.ESCALA_MONETARIA);
    lancamento.criadoEm = new Date();

    await this.lancamentoRepositorio.salvar(lancamento, manager);

    const saldoAtual = new Decimal(conta.saldoCache);
    const novoSaldo = direcao === DirecaoLancamento.DEBITO ? saldoAtual.minus(valor) : saldoAtual.plus(valor);

    conta.saldoCache = novoSaldo.toFixed(ConstantUtils.ESCALA_MONETARIA);
    await this.contaRepositorio.salvar(conta, manager);
  }

  /**
   * Bloqueia as contas envolvidas em ordem crescente de id. A ordem é o que evita deadlock
   * quando duas transferências cruzadas (A→B e B→A) acontecem ao mesmo tempo: ambas pedem o
   * mesmo lock primeiro, então uma espera a outra em vez de travarem em ciclo.
   */
  private async bloquearContas(manager: EntityManager, ids: (string | undefined)[]): Promise<Map<string, Conta>> {
    const idsOrdenados = [...new Set(ids.filter((id): id is string => Boolean(id)))].sort();
    const contas = new Map<string, Conta>();

    for (const id of idsOrdenados) {
      const conta = await this.contaRepositorio.bloquearPorId(id, manager);
      if (!conta) {
        throw new ContaNaoEncontradaError();
      }
      contas.set(id, conta);
    }

    return contas;
  }

  private obterConta(contas: Map<string, Conta>, contaId: string): Conta {
    const conta = contas.get(contaId);
    if (!conta) {
      throw new ContaNaoEncontradaError();
    }
    return conta;
  }

  private garantirParticipacao(transacao: Transacao, contaId: string): void {
    const participa = transacao.contaOrigemId === contaId || transacao.contaDestinoId === contaId;
    if (!participa) {
      throw new AcessoNegadoError();
    }
  }

  private garantirReversibilidade(transacao: Transacao): void {
    if (transacao.status === StatusTransacao.ESTORNADA) {
      throw new TransacaoNaoReversivelError('ela já foi estornada');
    }

    if (transacao.status !== StatusTransacao.CONCLUIDA) {
      throw new TransacaoNaoReversivelError(`o status atual é ${transacao.status}`);
    }

    if (transacao.tipo === TipoTransacao.ESTORNO) {
      throw new TransacaoNaoReversivelError('um estorno não pode ser estornado');
    }
  }

  private converterValor(valor: string): Decimal {
    let valorDecimal: Decimal;

    try {
      valorDecimal = new Decimal(valor);
    } catch {
      throw new ValorInvalidoError(valor);
    }

    if (!valorDecimal.isFinite() || valorDecimal.lessThanOrEqualTo(0) || valorDecimal.decimalPlaces() > ConstantUtils.ESCALA_MONETARIA) {
      throw new ValorInvalidoError(valor);
    }

    return valorDecimal;
  }
}
