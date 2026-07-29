'use client';

import { useActionState, useState } from 'react';
import { Botao } from '@/components/ui';
import { estornar } from '../actions/estorno';
import type { EstadoEstorno } from '../types';

const ESTADO_INICIAL: EstadoEstorno = { status: 'inativo' };

export interface BotaoEstornoProps {
  transacaoId: string;
}

export function BotaoEstorno({ transacaoId }: BotaoEstornoProps) {
  const [estado, acaoEstornar, pendente] = useActionState(estornar, ESTADO_INICIAL);
  const [confirmando, setConfirmando] = useState(false);

  return (
    <form action={acaoEstornar} className="flex flex-col items-end gap-1">
      <input type="hidden" name="transacaoId" value={transacaoId} />

      {/* O estorno movimenta saldo e nao tem desfazer: o primeiro clique so abre a confirmacao. */}
      {confirmando ? (
        <div className="flex items-center justify-end gap-2">
          <Botao variante="fantasma" tamanho="sm" disabled={pendente} onClick={() => setConfirmando(false)}>
            Cancelar
          </Botao>

          <Botao type="submit" variante="perigo" tamanho="sm" carregando={pendente}>
            Confirmar
          </Botao>
        </div>
      ) : (
        <Botao variante="secundario" tamanho="sm" onClick={() => setConfirmando(true)}>
          Estornar
        </Botao>
      )}

      {estado.status === 'erro' && estado.mensagem && (
        <span role="alert" className="max-w-64 whitespace-normal text-right text-xs text-red-700">
          {estado.mensagem}
        </span>
      )}
    </form>
  );
}
