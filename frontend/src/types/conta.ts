import type { ValorMonetario } from './api';

export interface Conta {
  id: string;
  saldo: ValorMonetario;
  moeda: string;
}
