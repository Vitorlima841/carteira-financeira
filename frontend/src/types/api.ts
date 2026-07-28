/**
 * Contratos transversais da API NestJS do diretorio `backend/`.
 */

/** Data serializada em JSON (ISO 8601). No backend o campo e um `Date`. */
export type DataIso = string;

/**
 * Valor monetario trafegado como texto para preservar a precisao decimal
 * (o backend serializa com `Decimal.toFixed(2)`, ex.: `'150.00'`).
 */
export type ValorMonetario = string;

/**
 * Codigos emitidos pelos erros de dominio do backend.
 * Espelha o mapa `MAPA_CODIGO_PARA_STATUS` de `shared/filters/filtro-excecao-http.ts`.
 */
export type CodigoErroDominio =
  | 'SALDO_INSUFICIENTE'
  | 'CONTA_NAO_ENCONTRADA'
  | 'TRANSACAO_NAO_ENCONTRADA'
  | 'TRANSACAO_NAO_REVERSIVEL'
  | 'EMAIL_JA_CADASTRADO'
  | 'CREDENCIAIS_INVALIDAS'
  | 'TOKEN_INVALIDO'
  | 'ACESSO_NEGADO'
  | 'VALOR_INVALIDO'
  | 'TRANSFERENCIA_PARA_MESMA_CONTA'
  | 'USUARIO_NAO_ENCONTRADO';

/** Codigos sinteticos criados no frontend para falhas sem codigo de dominio. */
export type CodigoErroCliente = 'ERRO_DE_VALIDACAO' | 'ERRO_HTTP' | 'ERRO_DE_REDE' | 'TEMPO_ESGOTADO' | 'REQUISICAO_CANCELADA' | 'ERRO_DESCONHECIDO';

export type CodigoErro = CodigoErroDominio | CodigoErroCliente;

/**
 * Corpo de erro devolvido pelo `FiltroExcecaoHttp`.
 *
 * - Erros de dominio trazem `codigo` e `mensagem` como texto.
 * - Erros do `ValidationPipe` vem sem `codigo` e com `mensagem` em lista.
 */
export interface RespostaErroApi {
  statusCode: number;
  codigo?: string;
  mensagem: string | string[];
}

/** Resposta simples usada em endpoints sem payload (ex.: `POST /auth/logout`). */
export interface RespostaMensagem {
  mensagem: string;
}
