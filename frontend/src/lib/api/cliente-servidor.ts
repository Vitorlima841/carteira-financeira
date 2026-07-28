import axios, { type AxiosInstance } from 'axios';
import { cookies } from 'next/headers';
import { NOME_COOKIE_SESSAO } from '@/constants/sessao';
import { TEMPO_LIMITE_REQUISICAO_MS, obterUrlApiServidor } from './config';
import { converterParaErroApi } from './erros';

export async function obterTokenSessao(): Promise<string | undefined> {
  try {
    const armazenamentoCookies = await cookies();
    return armazenamentoCookies.get(NOME_COOKIE_SESSAO)?.value;
  } catch {
    return undefined;
  }
}

export const clienteApiServidor: AxiosInstance = axios.create({
  baseURL: obterUrlApiServidor(),
  timeout: TEMPO_LIMITE_REQUISICAO_MS,
  headers: { 'Content-Type': 'application/json' },
});

clienteApiServidor.interceptors.request.use(async (configuracao) => {
  const token = await obterTokenSessao();

  if (token && !configuracao.headers.has('Authorization')) {
    configuracao.headers.set('Cookie', `${NOME_COOKIE_SESSAO}=${token}`);
    configuracao.headers.set('Authorization', `Bearer ${token}`);
  }

  return configuracao;
});

clienteApiServidor.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => Promise.reject(converterParaErroApi(erro)),
);
