import type { DataIso, ValorMonetario } from './api';

export enum TipoTransacao {
  DEPOSITO = 'DEPOSITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ESTORNO = 'ESTORNO',
}

export enum StatusTransacao {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
  ESTORNADA = 'ESTORNADA',
  FALHOU = 'FALHOU',
}

export enum DirecaoLancamento {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

export interface Lancamento {
  id: string;
  contaId: string;
  direcao: DirecaoLancamento;
  valor: ValorMonetario;
  criadoEm: DataIso;
}

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  status: StatusTransacao;
  valor: ValorMonetario;
  contaOrigemId: string | null;
  contaDestinoId: string | null;
  transacaoEstornadaId: string | null;
  criadoEm: DataIso;
  lancamentos?: Lancamento[];
}

export interface ExtratoPaginado {
  dados: Transacao[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface FiltroTransacao {
  pagina?: number;
  limite?: number;
  tipo?: TipoTransacao;
  status?: StatusTransacao;
}

export interface CriarDepositoPayload {
  valor: ValorMonetario;
}

export interface CriarTransferenciaPayload {
  emailDestinatario: string;
  valor: ValorMonetario;
}
