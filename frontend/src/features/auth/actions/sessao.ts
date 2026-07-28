'use server';

import { redirect } from 'next/navigation';
import { ROTAS, ROTA_PADRAO_AUTENTICADO } from '@/constants/rotas';
import { TAMANHO_MINIMO_SENHA } from '@/constants/validacao';
import { converterParaErroApi } from '@/lib/api/erros';
import { ehEmailValido, ehTextoPreenchido, obterTextoDoFormulario } from '@/utils/validacao';
import type { CredenciaisLogin } from '@/types/auth';
import { autenticar, encerrarSessaoNaApi } from '../services/autenticacao-servico';
import { definirCookieSessao, definirCookieUsuario, removerCookieSessao, removerCookieUsuario } from '../services/sessao-servico';
import type { CampoLogin, EstadoFormularioLogin } from '../types';

const MENSAGEM_CREDENCIAIS_INVALIDAS = 'E-mail ou senha invalidos.';

function extrairCredenciais(dadosFormulario: FormData): CredenciaisLogin {
  return {
    email: obterTextoDoFormulario(dadosFormulario, 'email').trim(),
    senha: obterTextoDoFormulario(dadosFormulario, 'senha'),
  };
}

function validar({ email, senha }: CredenciaisLogin): Partial<Record<CampoLogin, string>> {
  const erros: Partial<Record<CampoLogin, string>> = {};

  if (!ehTextoPreenchido(email)) {
    erros.email = 'Informe seu e-mail.';
  } else if (!ehEmailValido(email)) {
    erros.email = 'Informe um e-mail valido.';
  }

  if (!ehTextoPreenchido(senha)) {
    erros.senha = 'Informe sua senha.';
  } else if (senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `A senha deve ter no minimo ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }

  return erros;
}

function tratarErro(erro: unknown, credenciais: CredenciaisLogin): EstadoFormularioLogin {
  const erroApi = converterParaErroApi(erro);
  const valores = { email: credenciais.email };

  if (erroApi.codigo === 'CREDENCIAIS_INVALIDAS') {
    return { status: 'erro', mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS, valores };
  }

  return { status: 'erro', mensagem: erroApi.message, valores };
}

export async function entrar(_estadoAnterior: EstadoFormularioLogin, dadosFormulario: FormData): Promise<EstadoFormularioLogin> {
  const credenciais = extrairCredenciais(dadosFormulario);
  const erros = validar(credenciais);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { email: credenciais.email } };
  }

  try {
    const { tokenAcesso, expiraEm, usuario } = await autenticar(credenciais);
    await definirCookieSessao(tokenAcesso, expiraEm);
    await definirCookieUsuario({ nome: usuario.nome, email: usuario.email }, expiraEm);
  } catch (erro) {
    return tratarErro(erro, credenciais);
  }

  redirect(ROTA_PADRAO_AUTENTICADO);
}

export async function sair(): Promise<void> {
  await encerrarSessaoNaApi().catch(() => undefined);
  await removerCookieSessao();
  await removerCookieUsuario();

  redirect(ROTAS.login);
}
