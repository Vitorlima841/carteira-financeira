'use client';

import { useActionState } from 'react';
import { Alerta, Botao, Campo } from '@/components/ui';
import { TAMANHO_MAXIMO_EMAIL, TAMANHO_MINIMO_SENHA } from '@/constants/validacao';
import { entrar } from '../actions/sessao';
import type { EstadoFormularioLogin } from '../types';

const ESTADO_INICIAL: EstadoFormularioLogin = { status: 'inativo' };

export function FormularioLogin() {
  const [estado, acaoEntrar, pendente] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <form action={acaoEntrar} className="flex flex-col gap-4">
      {estado.status === 'erro' && estado.mensagem && <Alerta variante="erro">{estado.mensagem}</Alerta>}

      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        maxLength={TAMANHO_MAXIMO_EMAIL}
        defaultValue={estado.valores?.email}
        erro={estado.errosPorCampo?.email}
        disabled={pendente}
        required
      />

      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        placeholder="Sua senha"
        minLength={TAMANHO_MINIMO_SENHA}
        erro={estado.errosPorCampo?.senha}
        disabled={pendente}
        required
      />

      <Botao type="submit" carregando={pendente} larguraTotal>
        Entrar
      </Botao>
    </form>
  );
}
