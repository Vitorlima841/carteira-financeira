import type { DataIso } from './api';

/** Espelha `UsuarioRespostaDto` do backend. */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: DataIso;
}

/** Corpo de `POST /usuarios` (`CriarUsuarioDto`). */
export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
}
