import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FiltroTransacaoDto } from '../model/transacao/DTO/filtro-transacao.dto';
import { Transacao } from '../model/transacao/transacao.entity';

@Injectable()
export class TransacaoRepositorioTypeOrm {
  constructor(
    @InjectRepository(Transacao)
    private readonly repositorioOrm: Repository<Transacao>,
  ) {}

  async buscarPorId(id: string, manager?: EntityManager): Promise<Transacao | null> {
    const entidadeOrm = await this.obterRepositorio(manager).findOne({ where: { id } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  /**
   * Bloqueia a linha da transação com SELECT ... FOR UPDATE, serializando estornos
   * concorrentes da mesma transação.
   */
  async bloquearPorId(id: string, manager: EntityManager): Promise<Transacao | null> {
    const entidadeOrm = await manager.createQueryBuilder(Transacao, 'transacao').setLock('pessimistic_write').where('transacao.id = :id', { id }).getOne();
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async listarPorConta(contaId: string, filtro: FiltroTransacaoDto, manager?: EntityManager): Promise<[Transacao[], number]> {
    const consulta = this.obterRepositorio(manager).createQueryBuilder('transacao').where('(transacao.contaOrigemId = :contaId OR transacao.contaDestinoId = :contaId)', {
      contaId,
    });

    if (filtro.tipo) {
      consulta.andWhere('transacao.tipo = :tipo', { tipo: filtro.tipo });
    }

    if (filtro.status) {
      consulta.andWhere('transacao.status = :status', { status: filtro.status });
    }

    const [entidadesOrm, total] = await consulta
      .orderBy('transacao.criadoEm', 'DESC')
      .addOrderBy('transacao.id', 'DESC')
      .skip((filtro.pagina - 1) * filtro.limite)
      .take(filtro.limite)
      .getManyAndCount();

    return [entidadesOrm.map((entidadeOrm) => this.paraDominio(entidadeOrm)), total];
  }

  async salvar(transacao: Transacao, manager?: EntityManager): Promise<void> {
    await this.obterRepositorio(manager).save(this.paraOrm(transacao));
  }

  private obterRepositorio(manager?: EntityManager): Repository<Transacao> {
    return manager ? manager.getRepository(Transacao) : this.repositorioOrm;
  }

  private paraDominio(entidadeOrm: Transacao): Transacao {
    const transacao = new Transacao();

    transacao.id = entidadeOrm.id;
    transacao.tipo = entidadeOrm.tipo;
    transacao.status = entidadeOrm.status;
    transacao.valor = entidadeOrm.valor;
    transacao.contaOrigemId = entidadeOrm.contaOrigemId;
    transacao.contaDestinoId = entidadeOrm.contaDestinoId;
    transacao.transacaoEstornadaId = entidadeOrm.transacaoEstornadaId;
    transacao.metadados = entidadeOrm.metadados;
    transacao.criadoEm = entidadeOrm.criadoEm;
    transacao.atualizadoEm = entidadeOrm.atualizadoEm;

    return transacao;
  }

  private paraOrm(transacao: Transacao): Transacao {
    const entidadeOrm = new Transacao();
    entidadeOrm.id = transacao.id;
    entidadeOrm.tipo = transacao.tipo;
    entidadeOrm.status = transacao.status;
    entidadeOrm.valor = transacao.valor;
    entidadeOrm.contaOrigemId = transacao.contaOrigemId;
    entidadeOrm.contaDestinoId = transacao.contaDestinoId;
    entidadeOrm.transacaoEstornadaId = transacao.transacaoEstornadaId;
    entidadeOrm.metadados = transacao.metadados;
    return entidadeOrm;
  }
}
