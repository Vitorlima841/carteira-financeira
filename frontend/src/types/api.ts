export type DataIso = string;

export type ValorMonetario = string;

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

export type CodigoErroCliente = 'ERRO_DE_VALIDACAO' | 'ERRO_HTTP' | 'ERRO_DE_REDE' | 'TEMPO_ESGOTADO' | 'REQUISICAO_CANCELADA' | 'ERRO_DESCONHECIDO';

export type CodigoErro = CodigoErroDominio | CodigoErroCliente;

export interface RespostaErroApi {
  statusCode: number;
  codigo?: string;
  mensagem: string | string[];
}

export interface RespostaMensagem {
  mensagem: string;
}
