import { ContextoTeste, criarContextoTeste, encerrarContexto, requisicao } from './utils/aplicacao-teste';
import { limparBanco } from './utils/banco-teste';
import { cadastrarUsuario, criarUsuarioAutenticado, emailUnico, extrairCookieJwt, SENHA_PADRAO } from './utils/fabricas';

function decodificarPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
}

describe('Autenticação (integração)', () => {
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

  describe('POST /auth/login', () => {
    it('autentica com credenciais válidas e devolve token, expiração e usuário', async () => {
      const credenciais = await cadastrarUsuario(contexto);

      const resposta = await requisicao(contexto).post('/auth/login').send({ email: credenciais.email, senha: credenciais.senha }).expect(200);

      expect(resposta.body).toEqual({
        tokenAcesso: expect.any(String),
        expiraEm: expect.any(String),
        usuario: {
          id: expect.any(String),
          nome: credenciais.nome,
          email: credenciais.email,
          criadoEm: expect.any(String),
        },
      });
      expect(new Date(resposta.body.expiraEm).getTime()).toBeGreaterThan(Date.now());
    });

    it('emite um token vinculado ao usuário autenticado', async () => {
      const credenciais = await cadastrarUsuario(contexto);

      const resposta = await requisicao(contexto).post('/auth/login').send({ email: credenciais.email, senha: credenciais.senha }).expect(200);

      const payload = decodificarPayload(resposta.body.tokenAcesso);
      expect(payload.sub).toBe(resposta.body.usuario.id);
      expect(payload.email).toBe(credenciais.email);
      expect(new Date((payload.exp as number) * 1000).toISOString()).toBe(new Date(resposta.body.expiraEm).toISOString());
    });

    it('grava o token em um cookie httpOnly', async () => {
      const credenciais = await cadastrarUsuario(contexto);

      const resposta = await requisicao(contexto).post('/auth/login').send({ email: credenciais.email, senha: credenciais.senha }).expect(200);

      const cookie = extrairCookieJwt(resposta);
      expect(cookie).toContain(`jwt_token=${resposta.body.tokenAcesso}`);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('rejeita senha incorreta com 401 e mensagem genérica', async () => {
      const credenciais = await cadastrarUsuario(contexto);

      const resposta = await requisicao(contexto).post('/auth/login').send({ email: credenciais.email, senha: 'senha-errada' }).expect(401);

      expect(resposta.body).toEqual({
        statusCode: 401,
        codigo: 'CREDENCIAIS_INVALIDAS',
        mensagem: 'E-mail ou senha inválidos',
      });
      expect(resposta.headers['set-cookie']).toBeUndefined();
    });

    it('rejeita e-mail inexistente com a mesma resposta de senha incorreta (não revela cadastro)', async () => {
      const credenciais = await cadastrarUsuario(contexto);

      const respostaSenhaErrada = await requisicao(contexto).post('/auth/login').send({ email: credenciais.email, senha: 'senha-errada' }).expect(401);
      const respostaEmailInexistente = await requisicao(contexto).post('/auth/login').send({ email: emailUnico(), senha: SENHA_PADRAO }).expect(401);

      expect(respostaEmailInexistente.body).toEqual(respostaSenhaErrada.body);
    });

    it.each([
      ['e-mail inválido', { email: 'nao-e-um-email', senha: SENHA_PADRAO }],
      ['senha curta demais', { email: 'valido@exemplo.com', senha: '123' }],
      ['corpo vazio', {}],
    ])('rejeita %s com 400', async (_descricao, corpo) => {
      const resposta = await requisicao(contexto).post('/auth/login').send(corpo).expect(400);

      expect(resposta.body.mensagem).toEqual(expect.any(Array));
    });
  });

  describe('acesso a rotas protegidas', () => {
    it('aceita o token no header Authorization', async () => {
      const usuario = await criarUsuarioAutenticado(contexto);

      await requisicao(contexto).get('/contas/eu').set('Authorization', usuario.autorizacao).expect(200);
    });

    it('aceita o token no cookie jwt_token', async () => {
      const usuario = await criarUsuarioAutenticado(contexto);

      await requisicao(contexto).get('/contas/eu').set('Cookie', usuario.cookie).expect(200);
    });

    it('rejeita requisição sem credenciais com 401', async () => {
      const resposta = await requisicao(contexto).get('/contas/eu').expect(401);

      expect(resposta.body).toEqual({
        statusCode: 401,
        mensagem: 'Token de autenticação inválido ou expirado',
      });
    });

    it('rejeita token com assinatura adulterada com 401', async () => {
      const usuario = await criarUsuarioAutenticado(contexto);
      const tokenAdulterado = `${usuario.token.slice(0, -4)}aaaa`;

      await requisicao(contexto).get('/contas/eu').set('Authorization', `Bearer ${tokenAdulterado}`).expect(401);
    });

    it('rejeita token malformado com 401', async () => {
      await requisicao(contexto).get('/contas/eu').set('Authorization', 'Bearer nao-e-um-token').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('exige autenticação', async () => {
      await requisicao(contexto).post('/auth/logout').expect(401);
    });

    it('confirma a desconexão e limpa o cookie de sessão', async () => {
      const usuario = await criarUsuarioAutenticado(contexto);

      const resposta = await requisicao(contexto).post('/auth/logout').set('Authorization', usuario.autorizacao).expect(200);

      expect(resposta.body).toEqual({ mensagem: 'Desconectado com sucesso' });

      const cookie = extrairCookieJwt(resposta);
      expect(cookie).toContain('jwt_token=;');
      expect(cookie).toContain('Expires=Thu, 01 Jan 1970');
    });
  });
});
