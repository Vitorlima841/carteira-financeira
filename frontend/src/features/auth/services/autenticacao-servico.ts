import { clienteApiServidor } from '@/lib/api/cliente-servidor';
import type { RespostaMensagem } from '@/types/api';
import type { CredenciaisLogin, RespostaAutenticacao } from '@/types/auth';

const RECURSO_LOGIN = '/auth/login';
const RECURSO_LOGOUT = '/auth/logout';

export async function autenticar(credenciais: CredenciaisLogin): Promise<RespostaAutenticacao> {
  const { data } = await clienteApiServidor.post<RespostaAutenticacao>(RECURSO_LOGIN, credenciais);
  return data;
}

export async function encerrarSessaoNaApi(): Promise<RespostaMensagem> {
  const { data } = await clienteApiServidor.post<RespostaMensagem>(RECURSO_LOGOUT);
  return data;
}
