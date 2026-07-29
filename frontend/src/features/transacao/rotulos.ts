import { StatusTransacao, TipoTransacao } from '@/types/transacao';

export const ROTULOS_TIPO: Record<TipoTransacao, string> = {
  [TipoTransacao.DEPOSITO]: 'Deposito',
  [TipoTransacao.TRANSFERENCIA]: 'Transferencia',
  [TipoTransacao.ESTORNO]: 'Estorno',
};

export const ROTULOS_STATUS: Record<StatusTransacao, string> = {
  [StatusTransacao.PENDENTE]: 'Pendente',
  [StatusTransacao.CONCLUIDA]: 'Concluida',
  [StatusTransacao.ESTORNADA]: 'Estornada',
  [StatusTransacao.FALHOU]: 'Falhou',
};

export const CLASSES_STATUS: Record<StatusTransacao, string> = {
  [StatusTransacao.PENDENTE]: 'bg-amber-50 text-amber-700',
  [StatusTransacao.CONCLUIDA]: 'bg-emerald-50 text-emerald-700',
  [StatusTransacao.ESTORNADA]: 'bg-slate-100 text-slate-600',
  [StatusTransacao.FALHOU]: 'bg-red-50 text-red-700',
};
