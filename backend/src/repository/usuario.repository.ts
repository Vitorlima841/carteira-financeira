import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Usuario} from '../model/usuario/usuario.entity';

@Injectable()
export class UsuarioRepositorioTypeOrm {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioOrm: Repository<Usuario>,
  ) {}

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
