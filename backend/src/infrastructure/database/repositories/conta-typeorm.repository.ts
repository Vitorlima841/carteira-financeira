import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Conta } from '../../../modules/wallet/entities/conta.entity';
import { IContaRepository } from '../../../modules/wallet/repositories/conta-repository.interface';

@Injectable()
export class ContaTypeOrmRepository implements IContaRepository {
  constructor(
    @InjectRepository(Conta)
    private readonly repositorio: Repository<Conta>,
  ) {}

  async buscarPorId(id: string, queryRunner?: QueryRunner): Promise<Conta | null> {
    if (queryRunner) {
      return queryRunner.manager.findOne(Conta, { where: { id } });
    }
    return this.repositorio.findOne({ where: { id } });
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Conta | null> {
    return this.repositorio.findOne({ where: { usuarioId } });
  }

  async atualizarSaldo(
    id: string,
    saldo: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.manager.update(Conta, id, { saldo });
  }
}
