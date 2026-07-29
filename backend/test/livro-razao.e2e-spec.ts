import { ContextoTeste, criarContextoTeste, encerrarContexto } from './utils/aplicacao-teste';
import { conferirSaldosContraLivroRazao, limparBanco, listarLancamentosDaConta } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, estornar, obterSaldo, transferir, UsuarioTeste } from './utils/fabricas';

interface ConsistenciaTransacao {
  id: string;
  tipo: string;
  quantidade_lancamentos: string;
  valores_divergentes: string;
}

/**
 * Garante as invariantes contábeis do livro-razão de partida dobrada depois de um
 * cenário realista de uso, atravessando todos os endpoints de movimentação.
 */
describe('Livro-razão de partida dobrada (integração)', () => {
  let contexto: ContextoTeste;
  let maria: UsuarioTeste;
  let joao: UsuarioTeste;
  let ana: UsuarioTeste;

  beforeAll(async () => {
    contexto = await criarContextoTeste();
  });

  afterAll(async () => {
    await encerrarContexto(contexto);
  });

  beforeEach(async () => {
    await limparBanco(contexto);
    maria = await criarUsuarioAutenticado(contexto, { nome: 'Maria Silva' });
    joao = await criarUsuarioAutenticado(contexto, { nome: 'João Souza' });
    ana = await criarUsuarioAutenticado(contexto, { nome: 'Ana Lima' });

    // Cenário: depósitos, transferências em cadeia e um estorno.
    await depositar(contexto, maria, '1000.50');
    await depositar(contexto, joao, '200.25');
    await transferir(contexto, maria, joao, '300.75');
    await transferir(contexto, joao, ana, '100.00');
    const transferenciaEstornada = await transferir(contexto, maria, ana, '50.25');
    await estornar(contexto, ana, transferenciaEstornada.id);
  });

  it('mantém o saldo de cada conta igual à soma dos créditos menos os débitos', async () => {
    const contas = await conferirSaldosContraLivroRazao(contexto);

    expect(contas).toHaveLength(3);
    contas.forEach((conta) => {
      expect(Number(conta.saldo_cache)).toBe(Number(conta.saldo_calculado));
    });
  });

  it('chega aos saldos esperados pelo cenário', async () => {
    // Maria: 1000.50 - 300.75 - 50.25 + 50.25 (estorno) = 699.75
    expect(await obterSaldo(contexto, maria)).toBe('699.75');
    // João: 200.25 + 300.75 - 100.00 = 401.00
    expect(await obterSaldo(contexto, joao)).toBe('401.00');
    // Ana: 100.00 + 50.25 - 50.25 (estorno) = 100.00
    expect(await obterSaldo(contexto, ana)).toBe('100.00');
  });

  it('conserva o dinheiro do sistema: a soma dos saldos é igual ao total depositado', async () => {
    const saldos = await Promise.all([obterSaldo(contexto, maria), obterSaldo(contexto, joao), obterSaldo(contexto, ana)]);

    const total = saldos.reduce((soma, saldo) => soma + Number(saldo), 0);
    expect(total).toBeCloseTo(1000.5 + 200.25, 2);
  });

  it('gera a quantidade correta de lançamentos por tipo de transação', async () => {
    const consistencia = await contexto.fonteDados.query<ConsistenciaTransacao[]>(`
      SELECT
        transacoes.id,
        transacoes.tipo::text AS tipo,
        COUNT(lancamentos.id)::text AS quantidade_lancamentos,
        COUNT(lancamentos.id) FILTER (WHERE lancamentos.valor <> transacoes.valor)::text AS valores_divergentes
      FROM transacoes
      LEFT JOIN lancamentos ON lancamentos.transacao_id = transacoes.id
      GROUP BY transacoes.id, transacoes.tipo, transacoes.valor
    `);

    expect(consistencia).not.toHaveLength(0);
    consistencia.forEach((transacao) => {
      // Depósito credita uma conta; transferência move valor entre duas; o estorno
      // espelha os lançamentos da transação original.
      const esperado = transacao.tipo === 'DEPOSITO' ? '1' : '2';
      expect(transacao.quantidade_lancamentos).toBe(esperado);
      expect(transacao.valores_divergentes).toBe('0');
    });
  });

  it('nunca apaga nem altera lançamentos: o estorno entra como novo par de lançamentos', async () => {
    const lancamentosAna = await listarLancamentosDaConta(contexto, ana.contaId);

    // Recebeu 100.00 do João, recebeu 50.25 da Maria e devolveu 50.25 no estorno.
    expect(lancamentosAna).toHaveLength(3);
    expect(lancamentosAna.map((lancamento) => `${lancamento.direcao} ${lancamento.valor}`)).toEqual([
      'CREDITO 100.00',
      'CREDITO 50.25',
      'DEBITO 50.25',
    ]);
  });

  it('mantém as invariantes mesmo após um estorno que deixa a conta negativa', async () => {
    const deposito = await depositar(contexto, ana, '80.00');
    await transferir(contexto, ana, maria, '180.00');
    await estornar(contexto, ana, deposito.id);

    expect(await obterSaldo(contexto, ana)).toBe('-80.00');

    const contas = await conferirSaldosContraLivroRazao(contexto);
    contas.forEach((conta) => {
      expect(Number(conta.saldo_cache)).toBe(Number(conta.saldo_calculado));
    });
  });
});
