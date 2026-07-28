import type { DataIso } from './api';
import type { Usuario } from './usuario';

/** Corpo de `POST /auth/login` (`AuthDto`). */
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

/**
 * Espelha `RespostaAutenticacaoDto`.
 *
 * O mesmo token tambem chega no cookie httpOnly emitido pelo backend
 * (`SESSION_COOKIE_NAME`), que e o que o middleware e o cliente HTTP usam.
 */
export interface RespostaAutenticacao {
  tokenAcesso: string;
  expiraEm: DataIso;
  usuario: Usuario;
}
