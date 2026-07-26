import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IContextoTransacional,
  IUnidadeDeTrabalho,
} from '../dominio/unidade-de-trabalho.interface';
import { ContaRepositorioTypeOrm } from '../../modulos/carteira/infraestrutura/typeorm/conta.repositorio-typeorm';
import { TransacaoRepositorioTypeOrm } from '../../modulos/carteira/infraestrutura/typeorm/transacao.repositorio-typeorm';
import { UsuarioRepositorioTypeOrm } from '../../modulos/usuarios/infraestrutura/typeorm/usuario.repository';

/**
 * Implementação da Unidade de Trabalho utilizando as transações
 * nativas do TypeORM. Garante que operações em `Conta`, `Transacao` e
 * `Usuario` realizadas dentro de `executar` sejam atômicas.
 */
@Injectable()
export class UnidadeDeTrabalhoTypeOrm implements IUnidadeDeTrabalho {
  constructor(private readonly dataSource: DataSource) {}

  async executar<T>(trabalho: (contexto: IContextoTransacional) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (gerenciador) => {
      const contexto: IContextoTransacional = {
        contaRepositorio: ContaRepositorioTypeOrm.comGerenciador(gerenciador),
        transacaoRepositorio: TransacaoRepositorioTypeOrm.comGerenciador(gerenciador),
        usuarioRepositorio: UsuarioRepositorioTypeOrm.comGerenciador(gerenciador),
      };
      return trabalho(contexto);
    });
  }
}
