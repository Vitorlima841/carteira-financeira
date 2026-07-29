import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { limparBanco } from './utils/banco-teste';
import { criarUsuarioAutenticado, depositar, obterSaldo, transferir } from './utils/fabricas';

describe('GET /contas/eu (integração)', () => {
  let contexto: ContextoTeste;

  beforeAll(async () => {
    contexto = await criarContextoTeste();
  });

  afterAll(async () => {
    await encerrarContexto(contexto);
  });

  beforeEach(async () => {
    await limparBanco(contexto);
  });

  it('devolve a conta do usuário autenticado', async () => {
    const usuario = await criarUsuarioAutenticado(contexto);

    const resposta = await requisicao(contexto).get('/contas/eu').set('Authorization', usuario.autorizacao).expect(200);

    expect(resposta.body).toEqual({
      id: usuario.contaId,
      saldo: '0.00',
      moeda: 'BRL',
    });
  });

  it('reflete o saldo atualizado após movimentações', async () => {
    const usuario = await criarUsuarioAutenticado(contexto);

    await depositar(contexto, usuario, '150.75');
    expect(await obterSaldo(contexto, usuario)).toBe('150.75');

    await depositar(contexto, usuario, '49.25');
    expect(await obterSaldo(contexto, usuario)).toBe('200.00');
  });

  it('isola as contas: cada usuário enxerga apenas a própria', async () => {
    const maria = await criarUsuarioAutenticado(contexto, { nome: 'Maria' });
    const joao = await criarUsuarioAutenticado(contexto, { nome: 'João' });

    await depositar(contexto, maria, '500.00');
    await transferir(contexto, maria, joao, '200.00');

    const contaMaria = await requisicao(contexto).get('/contas/eu').set('Authorization', maria.autorizacao).expect(200);
    const contaJoao = await requisicao(contexto).get('/contas/eu').set('Authorization', joao.autorizacao).expect(200);

    expect(contaMaria.body.id).toBe(maria.contaId);
    expect(contaMaria.body.saldo).toBe('300.00');
    expect(contaJoao.body.id).toBe(joao.contaId);
    expect(contaJoao.body.saldo).toBe('200.00');
    expect(contaMaria.body.id).not.toBe(contaJoao.body.id);
  });

  it('sempre formata o saldo com duas casas decimais', async () => {
    const usuario = await criarUsuarioAutenticado(contexto);

    await depositar(contexto, usuario, '10');

    expect(await obterSaldo(contexto, usuario)).toBe('10.00');
  });

  it('exige autenticação', async () => {
    await requisicao(contexto).get('/contas/eu').expect(401);
  });
});
