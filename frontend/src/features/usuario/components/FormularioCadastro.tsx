'use client';

import { useActionState } from 'react';
import { Alerta, Botao, Campo } from '@/components/ui';
import { TAMANHO_MAXIMO_EMAIL, TAMANHO_MAXIMO_NOME, TAMANHO_MINIMO_SENHA } from '@/constants/validacao';
import { cadastrar } from '../actions/cadastro';
import type { EstadoFormularioCadastro } from '../types';

const ESTADO_INICIAL: EstadoFormularioCadastro = { status: 'inativo' };

export function FormularioCadastro() {
  const [estado, acaoCadastrar, pendente] = useActionState(cadastrar, ESTADO_INICIAL);

  return (
    <form action={acaoCadastrar} className="flex flex-col gap-4">
      {estado.status === 'erro' && estado.mensagem && <Alerta variante="erro">{estado.mensagem}</Alerta>}

      <Campo
        rotulo="Nome"
        name="nome"
        type="text"
        autoComplete="name"
        placeholder="Seu nome completo"
        maxLength={TAMANHO_MAXIMO_NOME}
        defaultValue={estado.valores?.nome}
        erro={estado.errosPorCampo?.nome}
        disabled={pendente}
        required
      />

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
        autoComplete="new-password"
        placeholder="Minimo de 6 caracteres"
        minLength={TAMANHO_MINIMO_SENHA}
        dica={`Use ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`}
        erro={estado.errosPorCampo?.senha}
        disabled={pendente}
        required
      />

      <Campo
        rotulo="Confirmar senha"
        name="confirmarSenha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        minLength={TAMANHO_MINIMO_SENHA}
        erro={estado.errosPorCampo?.confirmarSenha}
        disabled={pendente}
        required
      />

      <Botao type="submit" carregando={pendente} larguraTotal>
        Criar conta
      </Botao>
    </form>
  );
}
