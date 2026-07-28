export const ROTAS = {
  inicio: '/',
  login: '/login',
  registro: '/registro',
  conta: '/conta',
  transacoes: '/transacoes',
  perfil: '/perfil',
} as const;

export const ROTAS_PROTEGIDAS: readonly string[] = [ROTAS.conta, ROTAS.transacoes, ROTAS.perfil];

export const ROTAS_AUTENTICACAO: readonly string[] = [ROTAS.login, ROTAS.registro];

export const ROTA_PADRAO_AUTENTICADO: string = ROTAS.inicio;

export const PARAMETRO_CADASTRO = 'cadastro';

export const VALOR_CADASTRO_CONCLUIDO = 'concluido';
