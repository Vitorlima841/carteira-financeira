import type { DataIso } from './api';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: DataIso;
}

export interface CriarUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
}
