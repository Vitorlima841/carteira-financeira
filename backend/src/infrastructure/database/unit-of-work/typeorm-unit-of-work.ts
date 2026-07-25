import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { IUnitOfWork } from '../../../modules/wallet/unit-of-work/unit-of-work.interface';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async executar<T>(operacao: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const resultado = await operacao(queryRunner);
      await queryRunner.commitTransaction();
      return resultado;
    } catch (erro) {
      await queryRunner.rollbackTransaction();
      throw erro;
    } finally {
      await queryRunner.release();
    }
  }
}
