import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class UnidadeTrabalhoService {
  constructor(
    @InjectDataSource()
    private readonly fonteDados: DataSource,
  ) {}

  async executar<T>(operacao: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.fonteDados.transaction(async (manager) => operacao(manager));
  }
}
