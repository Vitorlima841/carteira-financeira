import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class TransferenciaParaMesmaContaError extends ErroDominio {
  readonly codigo = 'TRANSFERENCIA_PARA_MESMA_CONTA';

  constructor() {
    super('Não é possível transferir para a própria conta');
  }
}
