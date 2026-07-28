'use server';

import { revalidarSaldo } from '@/features/conta/actions/revalidacao';
import { converterParaErroApi } from '@/lib/api/erros';
import { formatarMoeda } from '@/utils/moeda';
import { criarTransferencia } from '../services/transacao-servico';
import type { CriarTransferenciaPayload, EstadoFormularioTransferencia } from '../types';
import { MENSAGEM_VALOR_INVALIDO, extrairDadosTransferencia, validarTransferencia } from '../validacao';

const MENSAGEM_SALDO_INSUFICIENTE = 'Saldo insuficiente para concluir esta transferencia.';

const MENSAGEM_USUARIO_NAO_ENCONTRADO = 'Nao encontramos nenhum usuario com este e-mail.';

const MENSAGEM_MESMA_CONTA = 'Nao e possivel transferir para a sua propria conta.';

const MENSAGEM_CONTA_NAO_ENCONTRADA = 'Nao encontramos a sua conta. Atualize a pagina e tente novamente.';

function tratarErro(erro: unknown, dados: CriarTransferenciaPayload): EstadoFormularioTransferencia {
  const erroApi = converterParaErroApi(erro);
  const valores = { emailDestinatario: dados.emailDestinatario, valor: dados.valor };

  if (erroApi.codigo === 'VALOR_INVALIDO') {
    return { status: 'erro', errosPorCampo: { valor: MENSAGEM_VALOR_INVALIDO }, valores };
  }

  if (erroApi.codigo === 'TRANSFERENCIA_PARA_MESMA_CONTA') {
    return { status: 'erro', errosPorCampo: { emailDestinatario: MENSAGEM_MESMA_CONTA }, valores };
  }

  if (erroApi.codigo === 'USUARIO_NAO_ENCONTRADO') {
    return { status: 'erro', errosPorCampo: { emailDestinatario: MENSAGEM_USUARIO_NAO_ENCONTRADO }, valores };
  }

  if (erroApi.codigo === 'CONTA_NAO_ENCONTRADA') {
    return { status: 'erro', mensagem: MENSAGEM_CONTA_NAO_ENCONTRADA, valores };
  }

  if (erroApi.codigo === 'SALDO_INSUFICIENTE') {
    return { status: 'erro', mensagem: MENSAGEM_SALDO_INSUFICIENTE, valores };
  }

  return { status: 'erro', mensagem: erroApi.message, valores };
}

export async function transferir(_estadoAnterior: EstadoFormularioTransferencia, dadosFormulario: FormData): Promise<EstadoFormularioTransferencia> {
  const dados = extrairDadosTransferencia(dadosFormulario);
  const erros = validarTransferencia(dados);

  if (Object.keys(erros).length > 0) {
    return { status: 'erro', errosPorCampo: erros, valores: { emailDestinatario: dados.emailDestinatario, valor: dados.valor } };
  }

  try {
    const transacao = await criarTransferencia(dados);
    revalidarSaldo();

    return { status: 'sucesso', mensagem: `Transferencia de ${formatarMoeda(transacao.valor)} para ${dados.emailDestinatario} concluida.`, transacao };
  } catch (erro) {
    return tratarErro(erro, dados);
  }
}
