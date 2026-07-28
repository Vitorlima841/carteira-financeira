import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class TransacaoNaoEncontradaError extends ErroDominio {
  readonly codigo = 'TRANSACAO_NAO_ENCONTRADA';

  constructor() {
    super('Transação não encontrada');
  }
}
