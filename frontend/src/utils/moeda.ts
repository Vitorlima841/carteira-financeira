import type { ValorMonetario } from '@/types/api';

export const LOCALIDADE_PADRAO = 'pt-BR';

export const MOEDA_PADRAO = 'BRL';

function normalizarValor(valor: ValorMonetario | number): number {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function criarFormatador(moeda: string): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALIDADE_PADRAO, { style: 'currency', currency: moeda });
}

export function formatarMoeda(valor: ValorMonetario | number, moeda: string = MOEDA_PADRAO): string {
  const numero = normalizarValor(valor);

  try {
    return criarFormatador(moeda).format(numero);
  } catch {
    return criarFormatador(MOEDA_PADRAO).format(numero);
  }
}
