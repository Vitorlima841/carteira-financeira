import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { buscarUsuarioPersistido, limparBanco } from './utils/banco-teste';
import { cadastrarUsuario, criarUsuarioAutenticado, emailUnico, SENHA_PADRAO } from './utils/fabricas';

describe('POST /usuarios (integração)', () => {
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

  describe('cadastro bem-sucedido', () => {
    it('cria o usuário e devolve os dados públicos', async () => {
      const email = emailUnico();

      const resposta = await requisicao(contexto).post('/usuarios').send({ nome: 'Maria Silva', email, senha: SENHA_PADRAO }).expect(201);

      expect(resposta.body).toEqual({
        id: expect.any(String),
        nome: 'Maria Silva',
        email,
        criadoEm: expect.any(String),
      });
    });

    it('nunca expõe a senha na resposta', async () => {
      const resposta = await requisicao(contexto).post('/usuarios').send({ nome: 'Maria Silva', email: emailUnico(), senha: SENHA_PADRAO }).expect(201);

      expect(resposta.body).not.toHaveProperty('senha');
      expect(resposta.body).not.toHaveProperty('senhaHash');
      expect(JSON.stringify(resposta.body)).not.toContain(SENHA_PADRAO);
    });

    it('persiste a senha como hash bcrypt, nunca em texto puro', async () => {
      const email = emailUnico();

      await cadastrarUsuario(contexto, { email });

      const usuario = await buscarUsuarioPersistido(contexto, email);
      expect(usuario).toBeDefined();
      expect(usuario?.senha_hash).not.toBe(SENHA_PADRAO);
      expect(usuario?.senha_hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('cria automaticamente a conta do usuário com saldo zerado em BRL', async () => {
      const usuario = await criarUsuarioAutenticado(contexto);

      const resposta = await requisicao(contexto).get('/contas/eu').set('Authorization', usuario.autorizacao).expect(200);

      expect(resposta.body).toEqual({
        id: expect.any(String),
        saldo: '0.00',
        moeda: 'BRL',
      });
    });
  });

  describe('e-mail duplicado', () => {
    it('rejeita com 409 e código EMAIL_JA_CADASTRADO', async () => {
      const email = emailUnico();
      await cadastrarUsuario(contexto, { email });

      const resposta = await requisicao(contexto).post('/usuarios').send({ nome: 'Outra Pessoa', email, senha: SENHA_PADRAO }).expect(409);

      expect(resposta.body).toEqual({
        statusCode: 409,
        codigo: 'EMAIL_JA_CADASTRADO',
        mensagem: `O e-mail "${email}" já está cadastrado`,
      });
    });

    it('não cria um segundo usuário nem uma segunda conta', async () => {
      const email = emailUnico();
      await cadastrarUsuario(contexto, { email });

      await requisicao(contexto).post('/usuarios').send({ nome: 'Outra Pessoa', email, senha: SENHA_PADRAO }).expect(409);

      const [{ total: totalUsuarios }] = await contexto.fonteDados.query<{ total: string }[]>('SELECT COUNT(*)::text AS total FROM usuarios');
      const [{ total: totalContas }] = await contexto.fonteDados.query<{ total: string }[]>('SELECT COUNT(*)::text AS total FROM contas');

      expect(totalUsuarios).toBe('1');
      expect(totalContas).toBe('1');
    });
  });

  describe('validação da requisição', () => {
    it.each([
      ['e-mail inválido', { nome: 'Maria Silva', email: 'nao-e-um-email', senha: SENHA_PADRAO }],
      ['senha curta demais', { nome: 'Maria Silva', email: 'valido@exemplo.com', senha: '12345' }],
      ['nome vazio', { nome: '', email: 'valido@exemplo.com', senha: SENHA_PADRAO }],
      ['corpo vazio', {}],
    ])('rejeita %s com 400', async (_descricao, corpo) => {
      const resposta = await requisicao(contexto).post('/usuarios').send(corpo).expect(400);

      expect(resposta.body.statusCode).toBe(400);
      expect(resposta.body.mensagem).toEqual(expect.any(Array));
    });

    it('rejeita propriedades não declaradas no DTO (forbidNonWhitelisted)', async () => {
      const resposta = await requisicao(contexto)
        .post('/usuarios')
        .send({ nome: 'Maria Silva', email: emailUnico(), senha: SENHA_PADRAO, admin: true })
        .expect(400);

      expect(resposta.body.mensagem).toEqual(expect.arrayContaining([expect.stringContaining('admin')]));
    });

    it('não persiste nada quando a validação falha', async () => {
      await requisicao(contexto).post('/usuarios').send({ nome: 'Maria Silva', email: 'invalido', senha: '123' }).expect(400);

      const [{ total }] = await contexto.fonteDados.query<{ total: string }[]>('SELECT COUNT(*)::text AS total FROM usuarios');
      expect(total).toBe('0');
    });
  });

  it('é uma rota pública: não exige token', async () => {
    await requisicao(contexto).post('/usuarios').send({ nome: 'Maria Silva', email: emailUnico(), senha: SENHA_PADRAO }).expect(201);
  });
});
