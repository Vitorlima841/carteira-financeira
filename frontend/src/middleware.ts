import { NextResponse } from 'next/server';

/**
 * Esqueleto. Futuramente le o cookie de sessao (SESSION_COOKIE_NAME) e
 * redireciona usuarios nao autenticados para /login.
 *
 * O route group (dashboard) nao aparece na URL, por isso o matcher abaixo
 * aponta para os caminhos publicos reais das rotas protegidas.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/conta/:path*', '/transacoes/:path*', '/perfil/:path*'],
};
