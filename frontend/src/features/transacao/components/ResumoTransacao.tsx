import type { Transacao } from '@/types/transacao';
import { formatarDataHora } from '@/utils/data';
import { formatarMoeda } from '@/utils/moeda';
import { ROTULOS_STATUS, ROTULOS_TIPO } from '../rotulos';

export interface ResumoTransacaoProps {
  transacao: Transacao;
}

export function ResumoTransacao({ transacao }: ResumoTransacaoProps) {
  return (
    <dl className="flex flex-col gap-1">
      <div className="flex justify-between gap-4">
        <dt>Valor</dt>
        <dd className="font-medium">{formatarMoeda(transacao.valor)}</dd>
      </div>

      <div className="flex justify-between gap-4">
        <dt>Tipo</dt>
        <dd className="font-medium">{ROTULOS_TIPO[transacao.tipo]}</dd>
      </div>

      <div className="flex justify-between gap-4">
        <dt>Status</dt>
        <dd className="font-medium">{ROTULOS_STATUS[transacao.status]}</dd>
      </div>

      <div className="flex justify-between gap-4">
        <dt>Data</dt>
        <dd className="font-medium">{formatarDataHora(transacao.criadoEm)}</dd>
      </div>
    </dl>
  );
}
