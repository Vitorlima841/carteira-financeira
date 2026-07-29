import { DirecaoLancamento } from '../src/model/lancamento/enum/direcao-lancamento.enum';
import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { contarLancamentos, limparBanco, listarLancamentosDaTransacao } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, emailUnico, obterSaldo, transferir, UsuarioTeste } from './utils/fabricas';

describe('POST /transacoes/transferencias (integração)', () => {
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

  describe('transferência bem-sucedida', () => {
    beforeEach(async () => {
      await depositar(contexto, maria, '500.00');
    });

    it('devolve a transação com as contas de origem e destino', async () => {
      const resposta = await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: joao.email, valor: '120.50' })
        .expect(201);

      expect(resposta.body).toEqual({
        id: expect.any(String),
        tipo: 'TRANSFERENCIA',
        status: 'CONCLUIDA',
        valor: '120.50',
        contaOrigemId: maria.contaId,
        contaDestinoId: joao.contaId,
        transacaoEstornadaId: null,
        criadoEm: expect.any(String),
      });
    });

    it('debita a origem e credita o destino', async () => {
      await transferir(contexto, maria, joao, '120.50');

      expect(await obterSaldo(contexto, maria)).toBe('379.50');
      expect(await obterSaldo(contexto, joao)).toBe('120.50');
    });

    it('gera um débito e um crédito de mesmo valor na mesma transação', async () => {
      const transacao = await transferir(contexto, maria, joao, '120.50');

      const lancamentos = await listarLancamentosDaTransacao(contexto, transacao.id);
      expect(lancamentos).toHaveLength(2);
      expect(lancamentos).toEqual([
        expect.objectContaining({ conta_id: maria.contaId, direcao: DirecaoLancamento.DEBITO, valor: '120.50' }),
        expect.objectContaining({ conta_id: joao.contaId, direcao: DirecaoLancamento.CREDITO, valor: '120.50' }),
      ]);
    });

    it('preserva a soma dos saldos das duas contas', async () => {
      await transferir(contexto, maria, joao, '333.33');

      const saldoMaria = Number(await obterSaldo(contexto, maria));
      const saldoJoao = Number(await obterSaldo(contexto, joao));
      expect(saldoMaria + saldoJoao).toBe(500);
    });

    it('permite transferir exatamente todo o saldo disponível', async () => {
      await transferir(contexto, maria, joao, '500.00');

      expect(await obterSaldo(contexto, maria)).toBe('0.00');
      expect(await obterSaldo(contexto, joao)).toBe('500.00');
    });
  });

  describe('saldo insuficiente', () => {
    it('rejeita com 422 e código SALDO_INSUFICIENTE', async () => {
      await depositar(contexto, maria, '50.00');

      const resposta = await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: joao.email, valor: '80.00' })
        .expect(422);

      expect(resposta.body).toEqual({
        statusCode: 422,
        codigo: 'SALDO_INSUFICIENTE',
        mensagem: 'Saldo insuficiente: disponível 50.00, solicitado 80.00',
      });
    });

    it('não movimenta nenhuma das contas', async () => {
      await depositar(contexto, maria, '50.00');

      await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: joao.email, valor: '80.00' })
        .expect(422);

      expect(await obterSaldo(contexto, maria)).toBe('50.00');
      expect(await obterSaldo(contexto, joao)).toBe('0.00');
      expect(await contarLancamentos(contexto)).toBe(1); // apenas o depósito inicial
    });

    it('rejeita transferência a partir de conta zerada', async () => {
      await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: joao.email, valor: '0.01' })
        .expect(422);
    });
  });

  describe('destinatário inválido', () => {
    it('rejeita destinatário inexistente com 404', async () => {
      await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: emailUnico('fantasma'), valor: '10.00' })
        .expect(404);

      expect(resposta.body).toEqual({
        statusCode: 404,
        codigo: 'USUARIO_NAO_ENCONTRADO',
        mensagem: 'Usuário não encontrado',
      });
      expect(await obterSaldo(contexto, maria)).toBe('100.00');
    });

    it('rejeita transferência para a própria conta com 400', async () => {
      await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: maria.email, valor: '10.00' })
        .expect(400);

      expect(resposta.body).toEqual({
        statusCode: 400,
        codigo: 'TRANSFERENCIA_PARA_MESMA_CONTA',
        mensagem: 'Não é possível transferir para a própria conta',
      });
      expect(await obterSaldo(contexto, maria)).toBe('100.00');
    });
  });

  describe('validação da requisição', () => {
    it.each([
      ['e-mail do destinatário inválido', { emailDestinatario: 'nao-e-um-email', valor: '10.00' }],
      ['valor negativo', { emailDestinatario: 'destino@exemplo.com', valor: '-10.00' }],
      ['valor com mais de duas casas', { emailDestinatario: 'destino@exemplo.com', valor: '10.001' }],
      ['sem destinatário', { valor: '10.00' }],
      ['sem valor', { emailDestinatario: 'destino@exemplo.com' }],
    ])('rejeita %s com 400', async (_descricao, corpo) => {
      const resposta = await requisicao(contexto).post('/transacoes/transferencias').set('Authorization', maria.autorizacao).send(corpo).expect(400);

      expect(resposta.body.mensagem).toEqual(expect.any(Array));
    });

    it('rejeita valor zerado com código VALOR_INVALIDO', async () => {
      await depositar(contexto, maria, '100.00');

      const resposta = await requisicao(contexto)
        .post('/transacoes/transferencias')
        .set('Authorization', maria.autorizacao)
        .send({ emailDestinatario: joao.email, valor: '0' })
        .expect(400);

      expect(resposta.body.codigo).toBe('VALOR_INVALIDO');
    });
  });

  it('exige autenticação', async () => {
    await requisicao(contexto).post('/transacoes/transferencias').send({ emailDestinatario: joao.email, valor: '10.00' }).expect(401);
  });

  describe('concorrência', () => {
    it('não permite gastar o mesmo saldo duas vezes em requisições simultâneas', async () => {
      const ana = await criarUsuarioAutenticado(contexto, { nome: 'Ana Lima' });
      await depositar(contexto, maria, '100.00');

      const respostas = await Promise.all([
        requisicao(contexto).post('/transacoes/transferencias').set('Authorization', maria.autorizacao).send({ emailDestinatario: joao.email, valor: '100.00' }),
        requisicao(contexto).post('/transacoes/transferencias').set('Authorization', maria.autorizacao).send({ emailDestinatario: ana.email, valor: '100.00' }),
      ]);

      const status = respostas.map((resposta) => resposta.status).sort();
      expect(status).toEqual([201, 422]);

      expect(await obterSaldo(contexto, maria)).toBe('0.00');

      const saldoJoao = await obterSaldo(contexto, joao);
      const saldoAna = await obterSaldo(contexto, ana);
      expect([saldoJoao, saldoAna].sort()).toEqual(['0.00', '100.00']);
    });
  });
});
