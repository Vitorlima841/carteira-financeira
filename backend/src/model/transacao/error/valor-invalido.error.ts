import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class ValorInvalidoError extends ErroDominio {
  readonly codigo = 'VALOR_INVALIDO';

  constructor(valor: string) {
    super(`O valor "${valor}" é inválido: informe um número positivo com até 2 casas decimais`);
  }
}
