'use server';

import { revalidarSaldo } from '@/features/conta/actions/revalidacao';
import { converterParaErroApi } from '@/lib/api/erros';
import { formatarMoeda } from '@/utils/moeda';
import { criarDeposito } from '../services/transacao-servico';
import type { CriarDepositoPayload, EstadoFormularioDeposito } from '../types';
import { MENSAGEM_VALOR_INVALIDO, extrairDadosDeposito, validarDeposito } from '../validacao';

const MENSAGEM_CONTA_NAO_ENCONTRADA = 'Nao encontramos a sua conta. Atualize a pagina e tente novamente.';

function tratarErro(erro: unknown, dados: CriarDepositoPayload): EstadoFormularioDeposito {
  const erroApi = converterParaErroApi(erro);
  const valores = { valor: dados.valor };

  if (erroApi.codigo === 'VALOR_INVALIDO') {
    return { status: 'erro', errosPorCampo: { valor: MENSAGEM_VALOR_INVALIDO }, valores };
  }

  if (erroApi.codigo === 'CONTA_NAO_ENCONTRADA') {
    return { status: 'erro', mensagem: MENSAGEM_CONTA_NAO_ENCONTRADA, valores };
  }

  return { status: 'erro', mensagem: erroApi.message, valores };
}

export async function depositar(_estadoAnterior: EstadoFormularioDeposito, dadosFormulario: FormData): Promise<EstadoFormularioDeposito> {
  const dados = extrairDadosDeposito(dadosFormulario);
  const erros = validarDeposito(dados);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { valor: dados.valor } };
  }

  try {
    const transacao = await criarDeposito(dados);
    revalidarSaldo();

    return { status: 'sucesso', mensagem: `Deposito de ${formatarMoeda(transacao.valor)} concluido.`, transacao };
  } catch (erro) {
    return tratarErro(erro, dados);
  }
}
