export const TEMPO_LIMITE_REQUISICAO_MS = 15_000;

const URL_API_PADRAO = 'http://localhost:3000';

function resolverUrl(valor: string | undefined, nomeVariavel: string): string {
  if (valor) {
    return valor.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`A variavel de ambiente ${nomeVariavel} nao foi definida.`);
  }

  return URL_API_PADRAO;
}

export function obterUrlApiServidor(): string {
  return resolverUrl(process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL, 'API_URL');
}

export function obterUrlApiNavegador(): string {
  return resolverUrl(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');
}
