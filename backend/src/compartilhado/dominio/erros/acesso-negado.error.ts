import { ErroDominio } from '../erro-dominio';

/**
 * Lançado quando um usuário tenta acessar ou operar sobre um recurso
 * que não lhe pertence (ex.: conta ou transação de outro usuário).
 */
export class AcessoNegadoError extends ErroDominio {
  readonly codigo = 'ACESSO_NEGADO';

  constructor(mensagem = 'Você não tem permissão para acessar este recurso') {
    super(mensagem);
  }
}
