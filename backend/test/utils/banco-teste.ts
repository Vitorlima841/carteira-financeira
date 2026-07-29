import { DirecaoLancamento } from '../../src/model/lancamento/enum/direcao-lancamento.enum';
import { StatusTransacao } from '../../src/model/transacao/enum/status-transacao.enum';
import { TipoTransacao } from '../../src/model/transacao/enum/tipo-transacao.enum';
import { ContextoTeste } from './aplicacao-teste';

const TABELAS = ['lancamentos', 'transacoes', 'contas', 'usuarios'];

export interface LancamentoPersistido {
  id: string;
  transacao_id: string;
  conta_id: string;
  direcao: DirecaoLancamento;
  valor: string;
}

export interface TransacaoPersistida {
  id: string;
  tipo: TipoTransacao;
  status: StatusTransacao;
  valor: string;
  conta_origem_id: string | null;
  conta_destino_id: string | null;
  transacao_estornada_id: string | null;
}

export interface UsuarioPersistido {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
}

export interface SaldoConferido {
  conta_id: string;
  saldo_cache: string;
  saldo_calculado: string;
}

export async function limparBanco(contexto: ContextoTeste): Promise<void> {
  const tabelas = TABELAS.map((tabela) => `"${tabela}"`).join(', ');
  await contexto.fonteDados.query(`TRUNCATE TABLE ${tabelas} RESTART IDENTITY CASCADE`);
}

export async function buscarUsuarioPersistido(contexto: ContextoTeste, email: string): Promise<UsuarioPersistido | undefined> {
  const [usuario] = await contexto.fonteDados.query<UsuarioPersistido[]>('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1', [email]);
  return usuario;
}

export async function buscarTransacaoPersistida(contexto: ContextoTeste, id: string): Promise<TransacaoPersistida | undefined> {
  const [transacao] = await contexto.fonteDados.query<TransacaoPersistida[]>(
    'SELECT id, tipo, status, valor, conta_origem_id, conta_destino_id, transacao_estornada_id FROM transacoes WHERE id = $1',
    [id],
  );
  return transacao;
}

export async function listarLancamentosDaTransacao(contexto: ContextoTeste, transacaoId: string): Promise<LancamentoPersistido[]> {
  return contexto.fonteDados.query<LancamentoPersistido[]>(
    'SELECT id, transacao_id, conta_id, direcao, valor FROM lancamentos WHERE transacao_id = $1 ORDER BY direcao ASC',
    [transacaoId],
  );
}

export async function listarLancamentosDaConta(contexto: ContextoTeste, contaId: string): Promise<LancamentoPersistido[]> {
  return contexto.fonteDados.query<LancamentoPersistido[]>(
    'SELECT id, transacao_id, conta_id, direcao, valor FROM lancamentos WHERE conta_id = $1 ORDER BY criado_em ASC',
    [contaId],
  );
}

/**
 * Invariante central do livro-razão: o `saldo_cache` de cada conta precisa ser
 * exatamente a soma dos créditos menos a soma dos débitos dos seus lançamentos.
 */
export async function conferirSaldosContraLivroRazao(contexto: ContextoTeste): Promise<SaldoConferido[]> {
  return contexto.fonteDados.query<SaldoConferido[]>(`
    SELECT
      contas.id AS conta_id,
      contas.saldo_cache,
      COALESCE(
        SUM(CASE WHEN lancamentos.direcao = 'CREDITO' THEN lancamentos.valor ELSE -lancamentos.valor END),
        0
      ) AS saldo_calculado
    FROM contas
    LEFT JOIN lancamentos ON lancamentos.conta_id = contas.id
    GROUP BY contas.id, contas.saldo_cache
  `);
}

export async function contarLancamentos(contexto: ContextoTeste): Promise<number> {
  const [{ total }] = await contexto.fonteDados.query<{ total: string }[]>('SELECT COUNT(*)::text AS total FROM lancamentos');
  return Number(total);
}
