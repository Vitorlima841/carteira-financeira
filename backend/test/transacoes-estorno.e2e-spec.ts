import { randomUUID } from 'crypto';
import { DirecaoLancamento } from '../src/model/lancamento/enum/direcao-lancamento.enum';
import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { buscarTransacaoPersistida, limparBanco, listarLancamentosDaTransacao } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, estornar, obterSaldo, transferir, UsuarioTeste } from './utils/fabricas';

describe('POST /transacoes/:id/estornos (integração)', () => {
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

  describe('estorno de depósito', () => {
    it('cria uma transação de estorno que aponta para a original', async () => {
      const deposito = await depositar(contexto, maria, '200.00');

      const resposta = await requisicao(contexto).post(`/transacoes/${deposito.id}/estornos`).set('Authorization', maria.autorizacao).expect(201);

      expect(resposta.body).toEqual({
        id: expect.any(String),
        tipo: 'ESTORNO',
        status: 'CONCLUIDA',
        valor: '200.00',
        contaOrigemId: maria.contaId,
        contaDestinoId: null,
        transacaoEstornadaId: deposito.id,
        criadoEm: expect.any(String),
      });
    });

    it('devolve o saldo ao estado anterior', async () => {
      const deposito = await depositar(contexto, maria, '200.00');
      expect(await obterSaldo(contexto, maria)).toBe('200.00');

      await estornar(contexto, maria, deposito.id);

      expect(await obterSaldo(contexto, maria)).toBe('0.00');
    });

    it('marca a transação original como ESTORNADA, preservando o histórico', async () => {
      const deposito = await depositar(contexto, maria, '200.00');

      await estornar(contexto, maria, deposito.id);

      expect(await buscarTransacaoPersistida(contexto, deposito.id)).toMatchObject({
        tipo: 'DEPOSITO',
        status: 'ESTORNADA',
        valor: '200.00',
      });
    });

    it('gera um lançamento de débito espelhando o crédito original', async () => {
      const deposito = await depositar(contexto, maria, '200.00');

      const estorno = await estornar(contexto, maria, deposito.id);

      const lancamentos = await listarLancamentosDaTransacao(contexto, estorno.id);
      expect(lancamentos).toHaveLength(1);
      expect(lancamentos[0]).toMatchObject({
        conta_id: maria.contaId,
        direcao: DirecaoLancamento.DEBITO,
        valor: '200.00',
      });
    });
  });

  describe('estorno de transferência', () => {
    it('reverte os saldos das duas contas', async () => {
      await depositar(contexto, maria, '500.00');
      const transferencia = await transferir(contexto, maria, joao, '150.00');

      await estornar(contexto, maria, transferencia.id);

      expect(await obterSaldo(contexto, maria)).toBe('500.00');
      expect(await obterSaldo(contexto, joao)).toBe('0.00');
    });

    it('inverte as contas de origem e destino no estorno', async () => {
      await depositar(contexto, maria, '500.00');
      const transferencia = await transferir(contexto, maria, joao, '150.00');

      const estorno = await estornar(contexto, maria, transferencia.id);

      expect(estorno).toMatchObject({
        tipo: 'ESTORNO',
        contaOrigemId: joao.contaId,
        contaDestinoId: maria.contaId,
        transacaoEstornadaId: transferencia.id,
      });
    });

    it('gera lançamentos invertidos em relação à transferência original', async () => {
      await depositar(contexto, maria, '500.00');
      const transferencia = await transferir(contexto, maria, joao, '150.00');

      const estorno = await estornar(contexto, maria, transferencia.id);

      const lancamentos = await listarLancamentosDaTransacao(contexto, estorno.id);
      expect(lancamentos).toEqual([
        expect.objectContaining({ conta_id: joao.contaId, direcao: DirecaoLancamento.DEBITO, valor: '150.00' }),
        expect.objectContaining({ conta_id: maria.contaId, direcao: DirecaoLancamento.CREDITO, valor: '150.00' }),
      ]);
    });

    it('permite que o destinatário também estorne a transferência recebida', async () => {
      await depositar(contexto, maria, '500.00');
      const transferencia = await transferir(contexto, maria, joao, '150.00');

      await estornar(contexto, joao, transferencia.id);

      expect(await obterSaldo(contexto, maria)).toBe('500.00');
      expect(await obterSaldo(contexto, joao)).toBe('0.00');
    });

    it('deixa a conta negativa quando o valor recebido já foi gasto (única operação que permite saldo negativo)', async () => {
      await depositar(contexto, maria, '500.00');
      const transferencia = await transferir(contexto, maria, joao, '150.00');
      await transferir(contexto, joao, maria, '150.00');

      await estornar(contexto, maria, transferencia.id);

      expect(await obterSaldo(contexto, joao)).toBe('-150.00');
    });
  });

  describe('transações não reversíveis', () => {
    it('rejeita o estorno de uma transação já estornada com 409', async () => {
      const deposito = await depositar(contexto, maria, '100.00');
      await estornar(contexto, maria, deposito.id);

      const resposta = await requisicao(contexto).post(`/transacoes/${deposito.id}/estornos`).set('Authorization', maria.autorizacao).expect(409);

      expect(resposta.body).toEqual({
        statusCode: 409,
        codigo: 'TRANSACAO_NAO_REVERSIVEL',
        mensagem: 'A transação não pode ser estornada: ela já foi estornada',
      });
    });

    it('rejeita o estorno de um estorno com 409', async () => {
      const deposito = await depositar(contexto, maria, '100.00');
      const estorno = await estornar(contexto, maria, deposito.id);

      const resposta = await requisicao(contexto).post(`/transacoes/${estorno.id}/estornos`).set('Authorization', maria.autorizacao).expect(409);

      expect(resposta.body).toEqual({
        statusCode: 409,
        codigo: 'TRANSACAO_NAO_REVERSIVEL',
        mensagem: 'A transação não pode ser estornada: um estorno não pode ser estornado',
      });
    });

    it('não altera o saldo em uma tentativa de estorno duplicado', async () => {
      const deposito = await depositar(contexto, maria, '100.00');
      await estornar(contexto, maria, deposito.id);

      await requisicao(contexto).post(`/transacoes/${deposito.id}/estornos`).set('Authorization', maria.autorizacao).expect(409);

      expect(await obterSaldo(contexto, maria)).toBe('0.00');
    });
  });

  describe('controle de acesso', () => {
    it('impede que um terceiro estorne uma transação da qual não participou', async () => {
      const deposito = await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto).post(`/transacoes/${deposito.id}/estornos`).set('Authorization', joao.autorizacao).expect(403);

      expect(resposta.body).toEqual({
        statusCode: 403,
        codigo: 'ACESSO_NEGADO',
        mensagem: 'Você não tem acesso a esta transação',
      });
      expect(await obterSaldo(contexto, maria)).toBe('100.00');
    });

    it('exige autenticação', async () => {
      const deposito = await depositar(contexto, maria, '100.00');

      await requisicao(contexto).post(`/transacoes/${deposito.id}/estornos`).expect(401);
    });
  });

  describe('identificador inválido', () => {
    it('devolve 404 para uma transação inexistente', async () => {
      const resposta = await requisicao(contexto).post(`/transacoes/${randomUUID()}/estornos`).set('Authorization', maria.autorizacao).expect(404);

      expect(resposta.body).toEqual({
        statusCode: 404,
        codigo: 'TRANSACAO_NAO_ENCONTRADA',
        mensagem: 'Transação não encontrada',
      });
    });

    it('devolve 400 quando o id não é um UUID', async () => {
      await requisicao(contexto).post('/transacoes/123/estornos').set('Authorization', maria.autorizacao).expect(400);
    });
  });
});
