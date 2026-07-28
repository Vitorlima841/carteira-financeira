import type { DataIso } from '@/types/api';
import { LOCALIDADE_PADRAO } from './moeda';

const FORMATADOR_DATA_HORA = new Intl.DateTimeFormat(LOCALIDADE_PADRAO, { dateStyle: 'short', timeStyle: 'short' });

export function formatarDataHora(valor: DataIso): string {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? '-' : FORMATADOR_DATA_HORA.format(data);
}
