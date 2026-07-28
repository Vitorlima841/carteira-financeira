'use client';

import { useActionState } from 'react';
import { CampoValorMonetario } from '@/components/forms';
import { Alerta, Botao } from '@/components/ui';
import { depositar } from '../actions/deposito';
import type { EstadoFormularioDeposito } from '../types';
import { extrairDadosDeposito, validarDeposito } from '../validacao';
import { ResumoTransacao } from './ResumoTransacao';

const ESTADO_INICIAL: EstadoFormularioDeposito = { status: 'inativo' };

async function validarEDepositar(estadoAnterior: EstadoFormularioDeposito, dadosFormulario: FormData): Promise<EstadoFormularioDeposito> {
  const dados = extrairDadosDeposito(dadosFormulario);
  const erros = validarDeposito(dados);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { valor: dados.valor } };
  }

  return depositar(estadoAnterior, dadosFormulario);
}

export function FormularioDeposito() {
  const [estado, acaoDepositar, pendente] = useActionState(validarEDepositar, ESTADO_INICIAL);

  return (
    <form action={acaoDepositar} className="flex flex-col gap-4">
      {estado.status === 'erro' && estado.mensagem && <Alerta variante="erro">{estado.mensagem}</Alerta>}

      {estado.status === 'sucesso' && estado.transacao && (
        <Alerta variante="sucesso" titulo={estado.mensagem}>
          <ResumoTransacao transacao={estado.transacao} />
        </Alerta>
      )}

      <CampoValorMonetario defaultValue={estado.valores?.valor} erro={estado.errosPorCampo?.valor} disabled={pendente} required />

      <Botao type="submit" carregando={pendente} larguraTotal>
        Depositar
      </Botao>
    </form>
  );
}
