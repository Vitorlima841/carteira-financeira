import { clienteApiServidor } from '@/lib/api/cliente-servidor';
import type { CriarDepositoPayload, CriarTransferenciaPayload, ExtratoPaginado, FiltroTransacao, Transacao } from '@/types/transacao';

const RECURSO_TRANSACOES = '/transacoes';

const RECURSO_DEPOSITOS = '/transacoes/depositos';

const RECURSO_TRANSFERENCIAS = '/transacoes/transferencias';

export async function listarExtrato(filtro: FiltroTransacao = {}): Promise<ExtratoPaginado> {
  const { data } = await clienteApiServidor.get<ExtratoPaginado>(RECURSO_TRANSACOES, { params: filtro });
  return data;
}

export async function criarDeposito(dados: CriarDepositoPayload): Promise<Transacao> {
  const { data } = await clienteApiServidor.post<Transacao>(RECURSO_DEPOSITOS, dados);
  return data;
}

export async function criarTransferencia(dados: CriarTransferenciaPayload): Promise<Transacao> {
  const { data } = await clienteApiServidor.post<Transacao>(RECURSO_TRANSFERENCIAS, dados);
  return data;
}

export async function criarEstorno(transacaoId: string): Promise<Transacao> {
  const { data } = await clienteApiServidor.post<Transacao>(`${RECURSO_TRANSACOES}/${transacaoId}/estornos`);
  return data;
}
