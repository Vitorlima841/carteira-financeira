import { randomUUID } from 'crypto';
import { DirecaoLancamento } from '../src/model/lancamento/enum/direcao-lancamento.enum';
import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { limparBanco } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, estornar, obterExtrato, transferir, UsuarioTeste } from './utils/fabricas';

describe('Consulta de transações (integração)', () => {
  let contexto: ContextoTeste;
  let maria: UsuarioTeste;
  let joao: UsuarioTeste;

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
  });

  describe('GET /transacoes (extrato)', () => {
    it('devolve um extrato vazio para uma conta sem movimentações', async () => {
      const extrato = await obterExtrato(contexto, maria);

      expect(extrato).toEqual({
        dados: [],
        pagina: 1,
        limite: 20,
        total: 0,
        totalPaginas: 0,
      });
    });

    it('lista as transações da conta da mais recente para a mais antiga', async () => {
      const primeiro = await depositar(contexto, maria, '10.00');
      const segundo = await depositar(contexto, maria, '20.00');
      const terceiro = await depositar(contexto, maria, '30.00');

      const extrato = await obterExtrato(contexto, maria);

      expect(extrato.total).toBe(3);
      expect(extrato.dados.map((transacao) => transacao.id)).toEqual([terceiro.id, segundo.id, primeiro.id]);
    });

    it('inclui tanto as transações enviadas quanto as recebidas', async () => {
      await depositar(contexto, maria, '100.00');
      const transferencia = await transferir(contexto, maria, joao, '40.00');

      const extratoMaria = await obterExtrato(contexto, maria);
      const extratoJoao = await obterExtrato(contexto, joao);

      expect(extratoMaria.total).toBe(2);
      expect(extratoJoao.total).toBe(1);
      expect(extratoJoao.dados[0].id).toBe(transferencia.id);
    });

    it('não vaza transações de outras contas', async () => {
      await depositar(contexto, maria, '100.00');
      await depositar(contexto, maria, '200.00');

      const extratoJoao = await obterExtrato(contexto, joao);

      expect(extratoJoao.dados).toEqual([]);
      expect(extratoJoao.total).toBe(0);
    });

    it('pagina os resultados', async () => {
      await depositar(contexto, maria, '10.00');
      await depositar(contexto, maria, '20.00');
      await depositar(contexto, maria, '30.00');

      const primeiraPagina = await obterExtrato(contexto, maria, { pagina: 1, limite: 2 });
      const segundaPagina = await obterExtrato(contexto, maria, { pagina: 2, limite: 2 });

      expect(primeiraPagina).toMatchObject({ pagina: 1, limite: 2, total: 3, totalPaginas: 2 });
      expect(primeiraPagina.dados).toHaveLength(2);
      expect(segundaPagina.dados).toHaveLength(1);

      const idsPaginados = [...primeiraPagina.dados, ...segundaPagina.dados].map((transacao) => transacao.id);
      expect(new Set(idsPaginados).size).toBe(3);
    });

    it('devolve página vazia além do último resultado', async () => {
      await depositar(contexto, maria, '10.00');

      const extrato = await obterExtrato(contexto, maria, { pagina: 5, limite: 20 });

      expect(extrato.dados).toEqual([]);
      expect(extrato.total).toBe(1);
    });

    it('filtra por tipo de transação', async () => {
      await depositar(contexto, maria, '100.00');
      const transferencia = await transferir(contexto, maria, joao, '40.00');

      const extrato = await obterExtrato(contexto, maria, { tipo: 'TRANSFERENCIA' });

      expect(extrato.total).toBe(1);
      expect(extrato.dados[0].id).toBe(transferencia.id);
    });

    it('filtra por status da transação', async () => {
      const deposito = await depositar(contexto, maria, '100.00');
      await depositar(contexto, maria, '50.00');
      await estornar(contexto, maria, deposito.id);

      const estornadas = await obterExtrato(contexto, maria, { status: 'ESTORNADA' });
      const concluidas = await obterExtrato(contexto, maria, { status: 'CONCLUIDA' });

      expect(estornadas.total).toBe(1);
      expect(estornadas.dados[0].id).toBe(deposito.id);
      expect(concluidas.total).toBe(2); // o segundo depósito e o estorno
    });

    it.each([
      ['página zero', { pagina: 0 }],
      ['página não numérica', { pagina: 'abc' }],
      ['limite acima do máximo', { limite: 101 }],
      ['limite zero', { limite: 0 }],
      ['tipo desconhecido', { tipo: 'PIX' }],
      ['status desconhecido', { status: 'QUALQUER' }],
      ['filtro não declarado', { ordenacao: 'asc' }],
    ])('rejeita %s com 400', async (_descricao, filtro) => {
      await requisicao(contexto)
        .get('/transacoes')
        .query(filtro as Record<string, string | number>)
        .set('Authorization', maria.autorizacao)
        .expect(400);
    });

    it('exige autenticação', async () => {
      await requisicao(contexto).get('/transacoes').expect(401);
    });
  });

  describe('GET /transacoes/:id (detalhe)', () => {
    it('detalha um depósito com o lançamento de crédito', async () => {
      const deposito = await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto).get(`/transacoes/${deposito.id}`).set('Authorization', maria.autorizacao).expect(200);

      expect(resposta.body).toMatchObject({
        id: deposito.id,
        tipo: 'DEPOSITO',
        status: 'CONCLUIDA',
        valor: '100.00',
      });
      expect(resposta.body.lancamentos).toEqual([
        expect.objectContaining({ contaId: maria.contaId, direcao: DirecaoLancamento.CREDITO, valor: '100.00' }),
      ]);
    });

    it('detalha uma transferência com o par débito/crédito', async () => {
      await depositar(contexto, maria, '100.00');
      const transferencia = await transferir(contexto, maria, joao, '40.00');

      const resposta = await requisicao(contexto).get(`/transacoes/${transferencia.id}`).set('Authorization', maria.autorizacao).expect(200);

      expect(resposta.body.lancamentos).toEqual([
        expect.objectContaining({ contaId: maria.contaId, direcao: DirecaoLancamento.DEBITO, valor: '40.00' }),
        expect.objectContaining({ contaId: joao.contaId, direcao: DirecaoLancamento.CREDITO, valor: '40.00' }),
      ]);
    });

    it('permite que o destinatário consulte a transferência recebida', async () => {
      await depositar(contexto, maria, '100.00');
      const transferencia = await transferir(contexto, maria, joao, '40.00');

      await requisicao(contexto).get(`/transacoes/${transferencia.id}`).set('Authorization', joao.autorizacao).expect(200);
    });

    it('impede o acesso de quem não participou da transação', async () => {
      const deposito = await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto).get(`/transacoes/${deposito.id}`).set('Authorization', joao.autorizacao).expect(403);

      expect(resposta.body.codigo).toBe('ACESSO_NEGADO');
    });

    it('devolve 404 para uma transação inexistente', async () => {
      const resposta = await requisicao(contexto).get(`/transacoes/${randomUUID()}`).set('Authorization', maria.autorizacao).expect(404);

      expect(resposta.body.codigo).toBe('TRANSACAO_NAO_ENCONTRADA');
    });

    it('devolve 400 quando o id não é um UUID', async () => {
      await requisicao(contexto).get('/transacoes/nao-e-uuid').set('Authorization', maria.autorizacao).expect(400);
    });

    it('exige autenticação', async () => {
      const deposito = await depositar(contexto, maria, '100.00');

      await requisicao(contexto).get(`/transacoes/${deposito.id}`).expect(401);
    });
  });
});
