import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class AcessoNegadoError extends ErroDominio {
  readonly codigo = 'ACESSO_NEGADO';

  constructor() {
    super('Você não tem acesso a esta transação');
  }
}
