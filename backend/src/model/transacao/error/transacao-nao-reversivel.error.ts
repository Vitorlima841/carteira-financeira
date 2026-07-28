import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class TransacaoNaoReversivelError extends ErroDominio {
  readonly codigo = 'TRANSACAO_NAO_REVERSIVEL';

  constructor(motivo: string) {
    super(`A transação não pode ser estornada: ${motivo}`);
  }
}
