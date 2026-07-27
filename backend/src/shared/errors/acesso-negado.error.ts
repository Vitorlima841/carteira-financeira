import { ErroDominio } from './erro-dominio';

export class AcessoNegadoError extends ErroDominio {
  readonly codigo = 'ACESSO_NEGADO';

  constructor(mensagem = 'Você não tem permissão para acessar este recurso') {
    super(mensagem);
  }
}
