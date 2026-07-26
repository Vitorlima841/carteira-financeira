import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../../dominio/usuario.entity';
import { IUsuarioRepositorio } from '../../dominio/repositorios/usuario.repositorio.interface';
import { UsuarioOrmEntity } from './usuario.orm-entity';

/**
 * Implementação do repositório de usuários utilizando TypeORM.
 * Traduz entre a entidade de domínio `Usuario` e a entidade de
 * persistência `UsuarioOrmEntity`.
 */
@Injectable()
export class UsuarioRepositorioTypeOrm implements IUsuarioRepositorio {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repositorioOrm: Repository<UsuarioOrmEntity>,
  ) {}

  /**
   * Cria uma nova instância vinculada a um `EntityManager` transacional,
   * utilizada pela Unidade de Trabalho.
   */
  static comGerenciador(gerenciador: EntityManager): UsuarioRepositorioTypeOrm {
    return new UsuarioRepositorioTypeOrm(gerenciador.getRepository(UsuarioOrmEntity));
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const entidadeOrm = await this.repositorioOrm.findOne({ where: { id } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const entidadeOrm = await this.repositorioOrm.findOne({ where: { email } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async salvar(usuario: Usuario): Promise<void> {
    await this.repositorioOrm.save(this.paraOrm(usuario));
  }

  private paraDominio(entidadeOrm: UsuarioOrmEntity): Usuario {
    return new Usuario(
      entidadeOrm.id,
      entidadeOrm.nome,
      entidadeOrm.email,
      entidadeOrm.senhaHash,
      entidadeOrm.criadoEm,
      entidadeOrm.atualizadoEm,
    );
  }

  private paraOrm(usuario: Usuario): UsuarioOrmEntity {
    const entidadeOrm = new UsuarioOrmEntity();
    entidadeOrm.id = usuario.id;
    entidadeOrm.nome = usuario.nome;
    entidadeOrm.email = usuario.email;
    entidadeOrm.senhaHash = usuario.senhaHash;
    return entidadeOrm;
  }
}
