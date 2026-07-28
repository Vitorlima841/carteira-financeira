export const ROTAS = {
  inicio: '/',
  login: '/login',
  registro: '/registro',
  conta: '/conta',
  transacoes: '/transacoes',
  depositar: '/transacoes/depositar',
  transferir: '/transacoes/transferir',
  perfil: '/perfil',
} as const;

export const ROTA_LAYOUT_PAINEL = '/(dashboard)';

export const ROTAS_PROTEGIDAS: readonly string[] = [ROTAS.conta, ROTAS.transacoes, ROTAS.perfil];

export const ROTAS_AUTENTICACAO: readonly string[] = [ROTAS.login, ROTAS.registro];

export const ROTA_PADRAO_AUTENTICADO: string = ROTAS.conta;

export const ROTA_PADRAO_VISITANTE: string = ROTAS.login;

/** A raiz nao tem conteudo proprio: leva ao painel quando ha sessao e ao login quando nao ha. */
export function resolverRotaInicial(possuiSessao: boolean): string {
  return possuiSessao ? ROTA_PADRAO_AUTENTICADO : ROTA_PADRAO_VISITANTE;
}

export const PARAMETRO_CADASTRO = 'cadastro';

export const VALOR_CADASTRO_CONCLUIDO = 'concluido';
