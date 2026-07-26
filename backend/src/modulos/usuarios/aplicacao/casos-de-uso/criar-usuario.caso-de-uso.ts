import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Usuario } from '../../dominio/usuario.entity';
import { IUsuarioRepositorio } from '../../dominio/repositorios/usuario.repositorio.interface';
import { EmailJaCadastradoError } from '../../dominio/erros/email-ja-cadastrado.error';

export interface DadosCriarUsuario {
  nome: string;
  email: string;
  senhaHash: string;
}

/**
 * Caso de uso responsável exclusivamente por criar um novo `Usuario`
 * (SRP). Recebe o repositório como parâmetro pois pode ser executado
 * dentro do contexto transacional de uma Unidade de Trabalho, junto
 * com a criação da conta associada.
 */
@Injectable()
export class CriarUsuarioCasoDeUso {
  async executar(
    usuarioRepositorio: IUsuarioRepositorio,
    dados: DadosCriarUsuario,
  ): Promise<Usuario> {
    const usuarioExistente = await usuarioRepositorio.buscarPorEmail(dados.email);
    if (usuarioExistente) {
      throw new EmailJaCadastradoError(dados.email);
    }

    const agora = new Date();
    const usuario = new Usuario(
      randomUUID(),
      dados.nome,
      dados.email,
      dados.senhaHash,
      agora,
      agora,
    );

    await usuarioRepositorio.salvar(usuario);
    return usuario;
  }
}
