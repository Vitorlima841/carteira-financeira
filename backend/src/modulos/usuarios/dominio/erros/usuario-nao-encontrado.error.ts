import { ErroDominio } from '../../../../compartilhado/dominio/erro-dominio';

export class UsuarioNaoEncontradoError extends ErroDominio {
  readonly codigo = 'USUARIO_NAO_ENCONTRADO';

  constructor() {
    super('Usuário não encontrado');
  }
}
