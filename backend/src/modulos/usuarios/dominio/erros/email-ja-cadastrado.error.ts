import { ErroDominio } from '../../../../compartilhado/dominio/erro-dominio';

export class EmailJaCadastradoError extends ErroDominio {
  readonly codigo = 'EMAIL_JA_CADASTRADO';

  constructor(email: string) {
    super(`O e-mail "${email}" já está cadastrado`);
  }
}
