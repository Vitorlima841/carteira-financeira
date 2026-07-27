import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {Usuario} from '../model/usuario/usuario.entity';

@Injectable()
export class UsuarioRepositorioTypeOrm {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioOrm: Repository<Usuario>,
  ) {}

  async buscarPorId(id: string, manager?: EntityManager): Promise<Usuario | null> {
    const entidadeOrm = await this.obterRepositorio(manager).findOne({ where: { id } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async buscarPorEmail(email: string, manager?: EntityManager): Promise<Usuario | null> {
    const entidadeOrm = await this.obterRepositorio(manager).findOne({ where: { email } });
    return entidadeOrm ? this.paraDominio(entidadeOrm) : null;
  }

  async salvar(usuario: Usuario, manager?: EntityManager): Promise<void> {
    await this.obterRepositorio(manager).save(this.paraOrm(usuario));
  }

  private obterRepositorio(manager?: EntityManager): Repository<Usuario> {
    return manager ? manager.getRepository(Usuario) : this.repositorioOrm;
  }

  private paraDominio(entidadeOrm: Usuario): Usuario {
    const usuario =  new Usuario();

    usuario.id = entidadeOrm.id;
    usuario.nome = entidadeOrm.nome;
    usuario.email = entidadeOrm.email;
    usuario.senhaHash = entidadeOrm.senhaHash;
    usuario.criadoEm = entidadeOrm.criadoEm;
    usuario.atualizadoEm = entidadeOrm.atualizadoEm;

    return usuario;
  }

  private paraOrm(usuario: Usuario): Usuario {
    const entidadeOrm = new Usuario();
    entidadeOrm.id = usuario.id;
    entidadeOrm.nome = usuario.nome;
    entidadeOrm.email = usuario.email;
    entidadeOrm.senhaHash = usuario.senhaHash;
    return entidadeOrm;
  }
}
