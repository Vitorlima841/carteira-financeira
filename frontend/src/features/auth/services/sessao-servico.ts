import { cookies } from 'next/headers';
import { CAMINHO_COOKIE_SESSAO, NOME_COOKIE_SESSAO, NOME_COOKIE_USUARIO } from '@/constants/sessao';
import { obterTokenSessao } from '@/lib/api/cliente-servidor';
import type { DataIso } from '@/types/api';
import type { UsuarioSessao } from '@/types/auth';

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

// A API nao expoe um recurso para ler o usuario logado, entao os dados de exibicao
// retornados pelo login ficam neste cookie httpOnly, lido apenas por Server Components.
export async function definirCookieUsuario(usuario: UsuarioSessao, expiraEm: DataIso): Promise<void> {
  const armazenamentoCookies = await cookies();

  armazenamentoCookies.set({
    name: NOME_COOKIE_USUARIO,
    value: encodeURIComponent(JSON.stringify(usuario)),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: CAMINHO_COOKIE_SESSAO,
    expires: converterExpiracao(expiraEm),
  });
}

export async function removerCookieUsuario(): Promise<void> {
  const armazenamentoCookies = await cookies();
  armazenamentoCookies.delete({ name: NOME_COOKIE_USUARIO, path: CAMINHO_COOKIE_SESSAO });
}

export async function obterUsuarioDaSessao(): Promise<UsuarioSessao | undefined> {
  try {
    const armazenamentoCookies = await cookies();
    const valor = armazenamentoCookies.get(NOME_COOKIE_USUARIO)?.value;

    if (!valor) {
      return undefined;
    }

    const dados = JSON.parse(decodeURIComponent(valor)) as Partial<UsuarioSessao>;
    return typeof dados.nome === 'string' && typeof dados.email === 'string' ? { nome: dados.nome, email: dados.email } : undefined;
  } catch {
    return undefined;
  }
}

export async function possuiSessao(): Promise<boolean> {
  return Boolean(await obterTokenSessao());
}
