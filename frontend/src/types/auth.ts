import type { DataIso } from './api';
import type { Usuario } from './usuario';

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface RespostaAutenticacao {
  tokenAcesso: string;
  expiraEm: DataIso;
  usuario: Usuario;
}

export interface UsuarioSessao {
  nome: string;
  email: string;
}
