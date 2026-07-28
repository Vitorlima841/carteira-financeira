import { cache } from 'react';
import { clienteApiServidor } from '@/lib/api/cliente-servidor';
import type { Conta } from '@/types/conta';

const RECURSO_CONTA_DO_USUARIO = '/contas/eu';

// O cache do React evita uma segunda requisicao quando o layout e a pagina pedem a mesma conta.
export const obterContaDoUsuario = cache(async (): Promise<Conta> => {
  const { data } = await clienteApiServidor.get<Conta>(RECURSO_CONTA_DO_USUARIO);
  return data;
});
