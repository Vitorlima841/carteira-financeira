import { DirecaoLancamento } from '../src/model/lancamento/enum/direcao-lancamento.enum';
import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { buscarTransacaoPersistida, contarLancamentos, limparBanco, listarLancamentosDaTransacao } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, obterSaldo, UsuarioTeste } from './utils/fabricas';

describe('POST /transacoes/depositos (integração)', () => {
  let contexto: ContextoTeste;
  let usuario: UsuarioTeste;

  beforeAll(async () => {
    contexto = await criarContextoTeste();
  });

  afterAll(async () => {
    await encerrarContexto(contexto);
  });

  beforeEach(async () => {
    await limparBanco(contexto);
    usuario = await criarUsuarioAutenticado(contexto);
  });

  describe('depósito bem-sucedido', () => {
    it('devolve a transação concluída com a conta de destino do usuário', async () => {
      const resposta = await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor: '150.00' }).expect(201);

      expect(resposta.body).toEqual({
        id: expect.any(String),
        tipo: 'DEPOSITO',
        status: 'CONCLUIDA',
        valor: '150.00',
        contaOrigemId: null,
        contaDestinoId: usuario.contaId,
        transacaoEstornadaId: null,
        criadoEm: expect.any(String),
      });
    });

    it('credita o valor no saldo da conta', async () => {
      await depositar(contexto, usuario, '150.00');

      expect(await obterSaldo(contexto, usuario)).toBe('150.00');
    });

    it('gera exatamente um lançamento de crédito no livro-razão', async () => {
      const transacao = await depositar(contexto, usuario, '150.00');

      const lancamentos = await listarLancamentosDaTransacao(contexto, transacao.id);
      expect(lancamentos).toHaveLength(1);
      expect(lancamentos[0]).toMatchObject({
        conta_id: usuario.contaId,
        direcao: DirecaoLancamento.CREDITO,
        valor: '150.00',
      });
    });

    it('acumula depósitos sucessivos', async () => {
      await depositar(contexto, usuario, '10.10');
      await depositar(contexto, usuario, '20.20');
      await depositar(contexto, usuario, '5.05');

      expect(await obterSaldo(contexto, usuario)).toBe('35.35');
    });

    it('soma centavos sem erro de ponto flutuante', async () => {
      await depositar(contexto, usuario, '0.01');
      await depositar(contexto, usuario, '0.02');

      expect(await obterSaldo(contexto, usuario)).toBe('0.03');
    });

    it('normaliza o valor para duas casas decimais', async () => {
      const transacao = await depositar(contexto, usuario, '10');

      expect(transacao.valor).toBe('10.00');
      expect(await obterSaldo(contexto, usuario)).toBe('10.00');
    });

    it('preserva a precisão de valores altos', async () => {
      await depositar(contexto, usuario, '9999999999999999.99');

      expect(await obterSaldo(contexto, usuario)).toBe('9999999999999999.99');
    });

    it('persiste a transação com o mesmo conteúdo devolvido pela API', async () => {
      const transacao = await depositar(contexto, usuario, '77.77');

      expect(await buscarTransacaoPersistida(contexto, transacao.id)).toMatchObject({
        tipo: 'DEPOSITO',
        status: 'CONCLUIDA',
        valor: '77.77',
        conta_origem_id: null,
        conta_destino_id: usuario.contaId,
        transacao_estornada_id: null,
      });
    });
  });

  describe('valores recusados pelo domínio', () => {
    it.each(['0', '0.00'])('rejeita o valor "%s" com 400 e código VALOR_INVALIDO', async (valor) => {
      const resposta = await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor }).expect(400);

      expect(resposta.body).toEqual({
        statusCode: 400,
        codigo: 'VALOR_INVALIDO',
        mensagem: `O valor "${valor}" é inválido: informe um número positivo com até 2 casas decimais`,
      });
    });
  });

  describe('valores recusados pela validação do DTO', () => {
    it.each([
      ['negativo', '-10.00'],
      ['não numérico', 'abc'],
      ['com mais de duas casas decimais', '10.999'],
      ['vazio', ''],
    ])('rejeita valor %s com 400', async (_descricao, valor) => {
      const resposta = await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor }).expect(400);

      expect(resposta.body.mensagem).toEqual(expect.any(Array));
    });

    it('rejeita valor numérico (deve ser enviado como texto para preservar a precisão)', async () => {
      const resposta = await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor: 10.5 }).expect(400);

      expect(resposta.body.mensagem).toEqual(expect.arrayContaining([expect.stringContaining('texto')]));
    });

    it('rejeita propriedades não declaradas no DTO', async () => {
      await requisicao(contexto)
        .post('/transacoes/depositos')
        .set('Authorization', usuario.autorizacao)
        .send({ valor: '10.00', contaDestinoId: usuario.contaId })
        .expect(400);
    });
  });

  describe('efeitos colaterais em falhas', () => {
    it('não altera o saldo nem cria lançamentos quando o valor é inválido', async () => {
      await depositar(contexto, usuario, '100.00');

      await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor: '0' }).expect(400);

      expect(await obterSaldo(contexto, usuario)).toBe('100.00');
      expect(await contarLancamentos(contexto)).toBe(1);
    });
  });

  it('exige autenticação', async () => {
    await requisicao(contexto).post('/transacoes/depositos').send({ valor: '10.00' }).expect(401);

    expect(await contarLancamentos(contexto)).toBe(0);
  });
});
