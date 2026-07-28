import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Conta } from '../model/conta/conta.entity';

@Injectable()
export class ContaRepositorioTypeOrm {
  constructor(
    @InjectRepository(Conta)
    private readonly repositorioOrm: Repository<Conta>,
  ) {}

  async buscarPorUsuarioId(usuarioId: string, manager?: EntityManager): Promise<Conta | null> {
    const entidade = await this.obterRepositorio(manager).findOne({ where: { usuarioId } });
    return entidade ? this.paraDominio(entidade) : null;
  }

  async bloquearPorId(id: string, manager: EntityManager): Promise<Conta | null> {
    const entidade = await manager.createQueryBuilder(Conta, 'conta')
      .setLock('pessimistic_write')
      .where('conta.id = :id', { id })
      .getOne();
    return entidade ? this.paraDominio(entidade) : null;
  }

  async salvar(conta: Conta, manager?: EntityManager): Promise<void> {
    await this.obterRepositorio(manager).save(this.paraOrm(conta));
  }

  private obterRepositorio(manager?: EntityManager): Repository<Conta> {
    return manager ? manager.getRepository(Conta) : this.repositorioOrm;
  }

  private paraDominio(entidade: Conta): Conta {
    const conta = new Conta();

    conta.id = entidade.id;
    conta.usuarioId = entidade.usuarioId;
    conta.saldoCache = entidade.saldoCache;
    conta.moeda = entidade.moeda;
    conta.criadoEm = entidade.criadoEm;
    conta.atualizadoEm = entidade.atualizadoEm;

    return conta;
  }

  private paraOrm(conta: Conta): Conta {
    const entidade = new Conta();
    entidade.id = conta.id;
    entidade.usuarioId = conta.usuarioId;
    entidade.saldoCache = conta.saldoCache;
    entidade.moeda = conta.moeda;
    return entidade;
  }
}
