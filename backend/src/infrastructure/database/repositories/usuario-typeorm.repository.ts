import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../../modules/users/entities/usuario.entity';
import { IUsuarioRepository } from '../../../modules/users/repositories/usuario-repository.interface';

@Injectable()
export class UsuarioTypeOrmRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repositorio: Repository<Usuario>,
  ) {}

  async criar(usuario: Partial<Usuario>): Promise<Usuario> {
    const entidade = this.repositorio.create(usuario);
    return this.repositorio.save(entidade);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { id } });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repositorio.findOne({ where: { email } });
  }

  async atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario> {
    await this.repositorio.update(id, dados);
    return this.buscarPorId(id);
  }

  async remover(id: string): Promise<void> {
    await this.repositorio.delete(id);
  }
}
