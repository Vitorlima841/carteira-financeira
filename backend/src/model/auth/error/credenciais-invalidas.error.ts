import { ErroDominio } from '../../../shared/errors/erro-dominio';
import { MensagensGlobais } from '../../../shared/utils/mensagens.util';

export class CredenciaisInvalidasError extends ErroDominio {
  readonly codigo = 'CREDENCIAIS_INVALIDAS';

  constructor() {
    super(MensagensGlobais.CREDENCIAIS_INVALIDAS);
  }
}
