import axios, { type AxiosInstance } from 'axios';
import { cookies } from 'next/headers';
import { TEMPO_LIMITE_REQUISICAO_MS, obterUrlApiServidor } from './config';
import { converterParaErroApi } from './erros';

/**
 * Cliente HTTP para uso EXCLUSIVO no servidor (Server Actions, Server
 * Components e route handlers). Importar este modulo de um Client Component
 * quebra o build, porque ele depende de `next/headers`.
 *
 * O cookie de sessao e httpOnly e nao acompanha requisicoes feitas de dentro
 * do servidor, entao ele e lido da requisicao atual e repassado a mao.
 */

export const NOME_COOKIE_SESSAO = process.env.SESSION_COOKIE_NAME ?? 'jwt_token';

/** Le o token da requisicao em andamento; `undefined` fora de um request. */
export async function obterTokenSessao(): Promise<string | undefined> {
  try {
    const armazenamentoCookies = await cookies();
    return armazenamentoCookies.get(NOME_COOKIE_SESSAO)?.value;
  } catch {
    // `cookies()` lanca fora do escopo de uma requisicao (ex.: build estatico).
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
