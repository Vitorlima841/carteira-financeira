import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IUsuarioRepositorio,
  USUARIO_REPOSITORIO,
} from '../model/usuario/usuario.repositorio.interface';
import { DadosCriarUsuario } from '../model/usuario/dados-criar-usuario.interface';
import { EmailJaCadastradoError } from '../model/usuario/email-ja-cadastrado.error';
import { UsuarioNaoEncontradoError } from '../model/usuario/usuario-nao-encontrado.error';
import {Usuario} from "../model/usuario/usuario.entity";

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIO_REPOSITORIO)
    private readonly usuarioRepositorio: IUsuarioRepositorio,
  ) {}

  async buscarUsuarioLogado(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }
    return usuario;
  }

  async criarUsuario(usuarioRepositorio: IUsuarioRepositorio, dados: DadosCriarUsuario): Promise<Usuario> {
    const usuarioExistente = await usuarioRepositorio.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      throw new EmailJaCadastradoError(dados.email);
    }

    const agora = new Date();
    const usuario =  new Usuario();

    usuario.id = randomUUID();
    usuario.nome = dados.nome;
    usuario.email = dados.email;
    usuario.senhaHash = dados.senhaHash;
    usuario.criadoEm = agora;
    usuario.atualizadoEm = agora;

    await usuarioRepositorio.salvar(usuario);
    return usuario;
  }
}
