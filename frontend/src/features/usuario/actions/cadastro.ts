'use server';

import { redirect } from 'next/navigation';
import { PARAMETRO_CADASTRO, ROTAS, VALOR_CADASTRO_CONCLUIDO } from '@/constants/rotas';
import { TAMANHO_MAXIMO_EMAIL, TAMANHO_MAXIMO_NOME, TAMANHO_MINIMO_SENHA } from '@/constants/validacao';
import { converterParaErroApi } from '@/lib/api/erros';
import { ehEmailValido, ehTextoPreenchido, obterTextoDoFormulario } from '@/utils/validacao';
import { cadastrarUsuario } from '../services/usuario-servico';
import type { CampoCadastro, EstadoFormularioCadastro } from '../types';

const MENSAGEM_EMAIL_JA_CADASTRADO = 'Este e-mail ja esta cadastrado. Entre na sua conta ou use outro e-mail.';

interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

function extrairDados(dadosFormulario: FormData): DadosCadastro {
  return {
    nome: obterTextoDoFormulario(dadosFormulario, 'nome').trim(),
    email: obterTextoDoFormulario(dadosFormulario, 'email').trim(),
    senha: obterTextoDoFormulario(dadosFormulario, 'senha'),
    confirmarSenha: obterTextoDoFormulario(dadosFormulario, 'confirmarSenha'),
  };
}

function validar({ nome, email, senha, confirmarSenha }: DadosCadastro): Partial<Record<CampoCadastro, string>> {
  const erros: Partial<Record<CampoCadastro, string>> = {};

  if (!ehTextoPreenchido(nome)) {
    erros.nome = 'Informe seu nome.';
  } else if (nome.length > TAMANHO_MAXIMO_NOME) {
    erros.nome = `O nome deve ter no maximo ${TAMANHO_MAXIMO_NOME} caracteres.`;
  }

  if (!ehTextoPreenchido(email)) {
    erros.email = 'Informe seu e-mail.';
  } else if (!ehEmailValido(email)) {
    erros.email = 'Informe um e-mail valido.';
  } else if (email.length > TAMANHO_MAXIMO_EMAIL) {
    erros.email = `O e-mail deve ter no maximo ${TAMANHO_MAXIMO_EMAIL} caracteres.`;
  }

  if (!ehTextoPreenchido(senha)) {
    erros.senha = 'Informe sua senha.';
  } else if (senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `A senha deve ter no minimo ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }

  if (!ehTextoPreenchido(confirmarSenha)) {
    erros.confirmarSenha = 'Confirme sua senha.';
  } else if (senha !== confirmarSenha) {
    erros.confirmarSenha = 'As senhas nao conferem.';
  }

  return erros;
}

function tratarErro(erro: unknown, dados: DadosCadastro): EstadoFormularioCadastro {
  const erroApi = converterParaErroApi(erro);
  const valores = { nome: dados.nome, email: dados.email };

  if (erroApi.codigo === 'EMAIL_JA_CADASTRADO') {
    return { status: 'erro', errosPorCampo: { email: MENSAGEM_EMAIL_JA_CADASTRADO }, valores };
  }

  return { status: 'erro', mensagem: erroApi.message, valores };
}

export async function cadastrar(_estadoAnterior: EstadoFormularioCadastro, dadosFormulario: FormData): Promise<EstadoFormularioCadastro> {
  const dados = extrairDados(dadosFormulario);
  const erros = validar(dados);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { nome: dados.nome, email: dados.email } };
  }

  try {
    await cadastrarUsuario({ nome: dados.nome, email: dados.email, senha: dados.senha });
  } catch (erro) {
    return tratarErro(erro, dados);
  }

  redirect(`${ROTAS.login}?${PARAMETRO_CADASTRO}=${VALOR_CADASTRO_CONCLUIDO}`);
}
