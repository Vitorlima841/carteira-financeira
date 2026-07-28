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

  async buscarPorId(id: string, manager?: EntityManager): Promise<Conta | null> {
    const entidadeOrm = await this.obterRepositorio(manager).findOne({ where: { id } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async buscarPorUsuarioId(usuarioId: string, manager?: EntityManager): Promise<Conta | null> {
    const entidadeOrm = await this.obterRepositorio(manager).findOne({ where: { usuarioId } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  /**
   * Bloqueia a linha da conta com SELECT ... FOR UPDATE. Deve ser chamado sempre em ordem
   * crescente de id quando houver mais de uma conta envolvida, para evitar deadlock.
   */
  async bloquearPorId(id: string, manager: EntityManager): Promise<Conta | null> {
    const entidadeOrm = await manager.createQueryBuilder(Conta, 'conta').setLock('pessimistic_write').where('conta.id = :id', { id }).getOne();
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async salvar(conta: Conta, manager?: EntityManager): Promise<void> {
    await this.obterRepositorio(manager).save(this.paraOrm(conta));
  }

  private obterRepositorio(manager?: EntityManager): Repository<Conta> {
    return manager ? manager.getRepository(Conta) : this.repositorioOrm;
  }

  private paraDominio(entidadeOrm: Conta): Conta {
    const conta = new Conta();

    conta.id = entidadeOrm.id;
    conta.usuarioId = entidadeOrm.usuarioId;
    conta.saldoCache = entidadeOrm.saldoCache;
    conta.moeda = entidadeOrm.moeda;
    conta.criadoEm = entidadeOrm.criadoEm;
    conta.atualizadoEm = entidadeOrm.atualizadoEm;

    return conta;
  }

  private paraOrm(conta: Conta): Conta {
    const entidadeOrm = new Conta();
    entidadeOrm.id = conta.id;
    entidadeOrm.usuarioId = conta.usuarioId;
    entidadeOrm.saldoCache = conta.saldoCache;
    entidadeOrm.moeda = conta.moeda;
    return entidadeOrm;
  }
}
