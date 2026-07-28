import type { ValorMonetario } from './api';

/** Espelha `ContaRespostaDto` do backend (`GET /contas/eu`). */
export interface Conta {
  id: string;
  saldo: ValorMonetario;
  moeda: string;
}
