'use server';

import { revalidarSaldo } from '@/features/conta/actions/revalidacao';
import { converterParaErroApi } from '@/lib/api/erros';
import { formatarMoeda } from '@/utils/moeda';
import { obterTextoDoFormulario } from '@/utils/validacao';
import { criarEstorno } from '../services/transacao-servico';
import type { EstadoEstorno } from '../types';
import { revalidarExtrato } from './revalidacao';

const MENSAGEM_TRANSACAO_AUSENTE = 'Nao foi possivel identificar a transacao. Atualize a pagina e tente novamente.';

const MENSAGEM_NAO_REVERSIVEL = 'Esta transacao nao pode mais ser estornada. Atualize a pagina para ver o status atual.';

const MENSAGEM_ACESSO_NEGADO = 'Voce nao participa desta transacao.';

const MENSAGEM_TRANSACAO_NAO_ENCONTRADA = 'Nao encontramos esta transacao. Atualize a pagina e tente novamente.';

const MENSAGEM_CONTA_NAO_ENCONTRADA = 'Nao encontramos a sua conta. Atualize a pagina e tente novamente.';

function tratarErro(erro: unknown): EstadoEstorno {
  const erroApi = converterParaErroApi(erro);

  // 409 significa que a tela esta desatualizada (outra aba ja estornou, por exemplo): revalidar traz a verdade.
  if (erroApi.codigo === 'TRANSACAO_NAO_REVERSIVEL') {
    revalidarExtrato();
    return { status: 'erro', mensagem: MENSAGEM_NAO_REVERSIVEL };
  }

  if (erroApi.codigo === 'ACESSO_NEGADO') {
    return { status: 'erro', mensagem: MENSAGEM_ACESSO_NEGADO };
  }

  if (erroApi.codigo === 'TRANSACAO_NAO_ENCONTRADA') {
    return { status: 'erro', mensagem: MENSAGEM_TRANSACAO_NAO_ENCONTRADA };
  }

  if (erroApi.codigo === 'CONTA_NAO_ENCONTRADA') {
    return { status: 'erro', mensagem: MENSAGEM_CONTA_NAO_ENCONTRADA };
  }

  return { status: 'erro', mensagem: erroApi.message };
}

export async function estornar(_estadoAnterior: EstadoEstorno, dadosFormulario: FormData): Promise<EstadoEstorno> {
  const transacaoId = obterTextoDoFormulario(dadosFormulario, 'transacaoId').trim();

  if (!transacaoId) {
    return { status: 'erro', mensagem: MENSAGEM_TRANSACAO_AUSENTE };
  }

  try {
    // Nao ha o que validar aqui: participacao e reversibilidade sao decididas pelo backend.
    const estorno = await criarEstorno(transacaoId);

    revalidarSaldo();
    revalidarExtrato();

    return { status: 'sucesso', mensagem: `Estorno de ${formatarMoeda(estorno.valor)} concluido.`, transacao: estorno };
  } catch (erro) {
    return tratarErro(erro);
  }
}
