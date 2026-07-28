import Decimal from 'decimal.js';
import { TipoTransacao } from '../enum/tipo-transacao.enum';

export interface DadosLancamentoDuplo {
  tipo: TipoTransacao;
  contaOrigemId?: string;
  contaDestinoId?: string;
  valor: Decimal;
  transacaoEstornadaId?: string;
}
