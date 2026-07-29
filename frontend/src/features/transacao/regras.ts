import { StatusTransacao, TipoTransacao, type Transacao } from '@/types/transacao';

export function podeEstornar(transacao: Transacao): boolean {
  return transacao.status === StatusTransacao.CONCLUIDA && transacao.tipo !== TipoTransacao.ESTORNO;
}
