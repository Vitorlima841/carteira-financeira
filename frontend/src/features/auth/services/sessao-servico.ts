import { cookies } from 'next/headers';
import { CAMINHO_COOKIE_SESSAO, NOME_COOKIE_SESSAO } from '@/constants/sessao';
import { obterTokenSessao } from '@/lib/api/cliente-servidor';
import type { DataIso } from '@/types/api';

function converterExpiracao(expiraEm: DataIso): Date | undefined {
  const data = new Date(expiraEm);
  return Number.isNaN(data.getTime()) ? undefined : data;
}

export async function definirCookieSessao(tokenAcesso: string, expiraEm: DataIso): Promise<void> {
  const armazenamentoCookies = await cookies();

  armazenamentoCookies.set({
    name: NOME_COOKIE_SESSAO,
    value: tokenAcesso,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: CAMINHO_COOKIE_SESSAO,
    expires: converterExpiracao(expiraEm),
  });
}

export async function removerCookieSessao(): Promise<void> {
  const armazenamentoCookies = await cookies();
  armazenamentoCookies.delete({ name: NOME_COOKIE_SESSAO, path: CAMINHO_COOKIE_SESSAO });
}

export async function possuiSessao(): Promise<boolean> {
  return Boolean(await obterTokenSessao());
}
