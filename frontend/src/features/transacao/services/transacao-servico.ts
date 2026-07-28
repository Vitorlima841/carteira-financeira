import { clienteApiServidor } from '@/lib/api/cliente-servidor';
import type { CriarDepositoPayload, CriarTransferenciaPayload, Transacao } from '@/types/transacao';

const RECURSO_DEPOSITOS = '/transacoes/depositos';

const RECURSO_TRANSFERENCIAS = '/transacoes/transferencias';

export async function criarDeposito(dados: CriarDepositoPayload): Promise<Transacao> {
  const { data } = await clienteApiServidor.post<Transacao>(RECURSO_DEPOSITOS, dados);
  return data;
}

export async function criarTransferencia(dados: CriarTransferenciaPayload): Promise<Transacao> {
  const { data } = await clienteApiServidor.post<Transacao>(RECURSO_TRANSFERENCIAS, dados);
  return data;
}
