import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Transacao } from '../../../modules/wallet/entities/transacao.entity';
import { ITransacaoRepository } from '../../../modules/wallet/repositories/transacao-repository.interface';

@Injectable()
export class TransacaoTypeOrmRepository implements ITransacaoRepository {
  constructor(
    @InjectRepository(Transacao)
    private readonly repositorio: Repository<Transacao>,
  ) {}

  async criar(
    transacao: Partial<Transacao>,
    queryRunner: QueryRunner,
  ): Promise<Transacao> {
    const entidade = queryRunner.manager.create(Transacao, transacao);
    return queryRunner.manager.save(entidade);
  }

  async buscarPorId(id: string): Promise<Transacao | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async listarPorConta(contaId: string): Promise<Transacao[]> {
    return this.repositorio.find({
      where: [{ contaOrigemId: contaId }, { contaDestinoId: contaId }],
    });
  }
}
