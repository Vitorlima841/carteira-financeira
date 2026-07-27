import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class ContaNaoEncontradaError extends ErroDominio {
  readonly codigo = 'CONTA_NAO_ENCONTRADA';

  constructor() {
    super('Conta não encontrada');
  }
}
