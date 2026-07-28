import { TAMANHO_MAXIMO_EMAIL } from '@/constants/validacao';
import { normalizarValorMonetario } from '@/utils/moeda';
import { ehEmailValido, ehTextoPreenchido, ehValorMonetarioValido, obterTextoDoFormulario } from '@/utils/validacao';
import type { CampoDeposito, CampoTransferencia, CriarDepositoPayload, CriarTransferenciaPayload } from './types';

export const MENSAGEM_VALOR_INVALIDO = 'Informe um valor maior que zero, com no maximo duas casas decimais.';

function validarValor(valor: string, mensagemObrigatorio: string): string | undefined {
  if (!ehTextoPreenchido(valor)) {
    return mensagemObrigatorio;
  }

  if (!ehValorMonetarioValido(valor)) {
    return MENSAGEM_VALOR_INVALIDO;
  }

  return undefined;
}

export function extrairDadosDeposito(dadosFormulario: FormData): CriarDepositoPayload {
  return {
    valor: normalizarValorMonetario(obterTextoDoFormulario(dadosFormulario, 'valor')),
  };
}

export function extrairDadosTransferencia(dadosFormulario: FormData): CriarTransferenciaPayload {
  return {
    emailDestinatario: obterTextoDoFormulario(dadosFormulario, 'emailDestinatario').trim(),
    valor: normalizarValorMonetario(obterTextoDoFormulario(dadosFormulario, 'valor')),
  };
}

export function validarDeposito({ valor }: CriarDepositoPayload): Partial<Record<CampoDeposito, string>> {
  const erros: Partial<Record<CampoDeposito, string>> = {};
  const erroValor = validarValor(valor, 'Informe o valor do deposito.');

  if (erroValor) {
    erros.valor = erroValor;
  }

  return erros;
}

export function validarTransferencia({ emailDestinatario, valor }: CriarTransferenciaPayload): Partial<Record<CampoTransferencia, string>> {
  const erros: Partial<Record<CampoTransferencia, string>> = {};

  if (!ehTextoPreenchido(emailDestinatario)) {
    erros.emailDestinatario = 'Informe o e-mail do destinatario.';
  } else if (!ehEmailValido(emailDestinatario)) {
    erros.emailDestinatario = 'Informe um e-mail valido.';
  } else if (emailDestinatario.length > TAMANHO_MAXIMO_EMAIL) {
    erros.emailDestinatario = `O e-mail deve ter no maximo ${TAMANHO_MAXIMO_EMAIL} caracteres.`;
  }

  const erroValor = validarValor(valor, 'Informe o valor da transferencia.');

  if (erroValor) {
    erros.valor = erroValor;
  }

  return erros;
}
