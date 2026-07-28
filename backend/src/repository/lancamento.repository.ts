import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Lancamento } from '../model/lancamento/lancamento.entity';

@Injectable()
export class LancamentoRepositorioTypeOrm {
  constructor(
    @InjectRepository(Lancamento)
    private readonly repositorioOrm: Repository<Lancamento>,
  ) {}

  async listarPorTransacaoId(transacaoId: string, manager?: EntityManager): Promise<Lancamento[]> {
    const entidadesOrm = await this.obterRepositorio(manager).find({
      where: { transacaoId },
      order: { direcao: 'ASC' },
    });
    return entidadesOrm.map((entidadeOrm) => this.paraDominio(entidadeOrm));
  }

  async salvar(lancamento: Lancamento, manager?: EntityManager): Promise<void> {
    await this.obterRepositorio(manager).save(this.paraOrm(lancamento));
  }

  private obterRepositorio(manager?: EntityManager): Repository<Lancamento> {
    return manager ? manager.getRepository(Lancamento) : this.repositorioOrm;
  }

  private paraDominio(entidadeOrm: Lancamento): Lancamento {
    const lancamento = new Lancamento();

    lancamento.id = entidadeOrm.id;
    lancamento.transacaoId = entidadeOrm.transacaoId;
    lancamento.contaId = entidadeOrm.contaId;
    lancamento.direcao = entidadeOrm.direcao;
    lancamento.valor = entidadeOrm.valor;
    lancamento.criadoEm = entidadeOrm.criadoEm;

    return lancamento;
  }

  private paraOrm(lancamento: Lancamento): Lancamento {
    const entidadeOrm = new Lancamento();
    entidadeOrm.id = lancamento.id;
    entidadeOrm.transacaoId = lancamento.transacaoId;
    entidadeOrm.contaId = lancamento.contaId;
    entidadeOrm.direcao = lancamento.direcao;
    entidadeOrm.valor = lancamento.valor;
    return entidadeOrm;
  }
}
