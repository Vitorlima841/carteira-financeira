import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../dominio/usuario.entity';
import {
  IUsuarioRepositorio,
  USUARIO_REPOSITORIO,
} from '../../dominio/repositorios/usuario.repositorio.interface';
import { UsuarioNaoEncontradoError } from '../../dominio/erros/usuario-nao-encontrado.error';

@Injectable()
export class BuscarUsuarioLogadoCasoDeUso {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly usuarioRepositorio: IUsuarioRepositorio,
  ) {}

  async executar(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }
    return usuario;
  }
}
