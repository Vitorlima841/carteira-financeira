import { NextResponse, type NextRequest } from 'next/server';
import { ROTAS, ROTAS_AUTENTICACAO, ROTAS_PROTEGIDAS, ROTA_PADRAO_AUTENTICADO } from '@/constants/rotas';
import { NOME_COOKIE_SESSAO } from '@/constants/sessao';

function correspondeA(caminho: string, rotas: readonly string[]): boolean {
  return rotas.some((rota) => caminho === rota || caminho.startsWith(`${rota}/`));
}

export function middleware(requisicao: NextRequest) {
  const { pathname } = requisicao.nextUrl;
  const possuiSessao = Boolean(requisicao.cookies.get(NOME_COOKIE_SESSAO)?.value);

  if (!possuiSessao && correspondeA(pathname, ROTAS_PROTEGIDAS)) {
    return NextResponse.redirect(new URL(ROTAS.login, requisicao.url));
  }

  if (possuiSessao && correspondeA(pathname, ROTAS_AUTENTICACAO)) {
    return NextResponse.redirect(new URL(ROTA_PADRAO_AUTENTICADO, requisicao.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/conta/:path*', '/transacoes/:path*', '/perfil/:path*', '/login', '/registro'],
};
