'use client';

import { useActionState } from 'react';
import { CampoValorMonetario } from '@/components/forms';
import { Alerta, Botao, Campo } from '@/components/ui';
import { TAMANHO_MAXIMO_EMAIL } from '@/constants/validacao';
import { transferir } from '../actions/transferencia';
import type { EstadoFormularioTransferencia } from '../types';
import { extrairDadosTransferencia, validarTransferencia } from '../validacao';
import { ResumoTransacao } from './ResumoTransacao';

const ESTADO_INICIAL: EstadoFormularioTransferencia = { status: 'inativo' };

async function validarETransferir(estadoAnterior: EstadoFormularioTransferencia, dadosFormulario: FormData): Promise<EstadoFormularioTransferencia> {
  const dados = extrairDadosTransferencia(dadosFormulario);
  const erros = validarTransferencia(dados);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { emailDestinatario: dados.emailDestinatario, valor: dados.valor } };
  }

  return transferir(estadoAnterior, dadosFormulario);
}

export function FormularioTransferencia() {
  const [estado, acaoTransferir, pendente] = useActionState(validarETransferir, ESTADO_INICIAL);

  return (
    <form action={acaoTransferir} className="flex flex-col gap-4">
      {estado.status === 'erro' && estado.mensagem && <Alerta variante="erro">{estado.mensagem}</Alerta>}

      {estado.status === 'sucesso' && estado.transacao && (
        <Alerta variante="sucesso" titulo={estado.mensagem}>
          <ResumoTransacao transacao={estado.transacao} />
        </Alerta>
      )}

      <Campo
        rotulo="E-mail do destinatario"
        name="emailDestinatario"
        type="email"
        autoComplete="off"
        placeholder="destinatario@exemplo.com"
        maxLength={TAMANHO_MAXIMO_EMAIL}
        defaultValue={estado.valores?.emailDestinatario}
        erro={estado.errosPorCampo?.emailDestinatario}
        disabled={pendente}
        required
      />

      <CampoValorMonetario defaultValue={estado.valores?.valor} erro={estado.errosPorCampo?.valor} disabled={pendente} required />

      <Botao type="submit" carregando={pendente} larguraTotal>
        Transferir
      </Botao>
    </form>
  );
}
