import { Lancamento } from '../../lancamento/lancamento.entity';
import { Transacao } from '../transacao.entity';

export interface TransacaoDetalhada {
  transacao: Transacao;
  lancamentos: Lancamento[];
}
