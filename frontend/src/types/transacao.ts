import type { DataIso, ValorMonetario } from './api';

/** Espelha `TipoTransacao` do backend. */
export enum TipoTransacao {
  DEPOSITO = 'DEPOSITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ESTORNO = 'ESTORNO',
}

/** Espelha `StatusTransacao` do backend. */
export enum StatusTransacao {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
  ESTORNADA = 'ESTORNADA',
  FALHOU = 'FALHOU',
}

/** Espelha `DirecaoLancamento` do backend. */
export enum DirecaoLancamento {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

/** Espelha `LancamentoRespostaDto`: uma perna do livro-razao de partida dobrada. */
export interface Lancamento {
  id: string;
  contaId: string;
  direcao: DirecaoLancamento;
  valor: ValorMonetario;
  criadoEm: DataIso;
}

/**
 * Espelha `TransacaoRespostaDto`.
 *
 * `lancamentos` so vem no detalhe (`GET /transacoes/:id`); a listagem do
 * extrato omite o campo.
 */
export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  status: StatusTransacao;
  valor: ValorMonetario;
  /** Nulo em depositos. */
  contaOrigemId: string | null;
  /** Nulo em estornos de deposito. */
  contaDestinoId: string | null;
  /** Preenchido apenas quando `tipo` e `ESTORNO`. */
  transacaoEstornadaId: string | null;
  criadoEm: DataIso;
  lancamentos?: Lancamento[];
}

/** Espelha `ExtratoPaginadoDto` (`GET /transacoes`). */
export interface ExtratoPaginado {
  dados: Transacao[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

/** Query string de `GET /transacoes` (`FiltroTransacaoDto`). */
export interface FiltroTransacao {
  pagina?: number;
  limite?: number;
  tipo?: TipoTransacao;
  status?: StatusTransacao;
}

/** Corpo de `POST /transacoes/depositos` (`CriarDepositoDto`). */
export interface CriarDepositoPayload {
  valor: ValorMonetario;
}

/** Corpo de `POST /transacoes/transferencias` (`CriarTransferenciaDto`). */
export interface CriarTransferenciaPayload {
  emailDestinatario: string;
  valor: ValorMonetario;
}
