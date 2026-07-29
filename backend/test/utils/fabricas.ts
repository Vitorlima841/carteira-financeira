import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { ContaRespostaDto } from '../../src/model/conta/DTO/conta-resposta.dto';
import { ExtratoPaginadoDto } from '../../src/model/transacao/DTO/extrato-paginado.dto';
import { TransacaoRespostaDto } from '../../src/model/transacao/DTO/transacao-resposta.dto';
import { ConstantUtils } from '../../src/shared/utils/constant.utils';
import { ContextoTeste, requisicao } from './aplicacao-teste';

export interface CredenciaisTeste {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioTeste extends CredenciaisTeste {
  id: string;
  contaId: string;
  token: string;
  autorizacao: string;
  cookie: string;
}

export const SENHA_PADRAO = 'senha-secreta';

export function emailUnico(prefixo = 'usuario'): string {
  return `${prefixo}-${randomUUID()}@exemplo.com`;
}

export function extrairCookieJwt(resposta: request.Response): string {
  const cabecalho = resposta.headers['set-cookie'] as unknown as string[] | undefined;
  const cookie = cabecalho?.find((valor) => valor.startsWith(`${ConstantUtils.JWT_TOKEN}=`));

  if (!cookie) {
    throw new Error('A resposta não contém o cookie jwt_token');
  }

  return cookie;
}

export async function cadastrarUsuario(contexto: ContextoTeste, sobrescritas: Partial<CredenciaisTeste> = {}): Promise<CredenciaisTeste> {
  const credenciais: CredenciaisTeste = {
    nome: 'Maria Silva',
    email: emailUnico(),
    senha: SENHA_PADRAO,
    ...sobrescritas,
  };

  await requisicao(contexto).post('/usuarios').send(credenciais).expect(201);

  return credenciais;
}

export async function autenticar(contexto: ContextoTeste, email: string, senha: string): Promise<request.Response> {
  return requisicao(contexto).post('/auth/login').send({ email, senha }).expect(200);
}

/** Cadastra um usuário, autentica e devolve tudo o que os testes precisam para agir como ele. */
export async function criarUsuarioAutenticado(contexto: ContextoTeste, sobrescritas: Partial<CredenciaisTeste> = {}): Promise<UsuarioTeste> {
  const credenciais = await cadastrarUsuario(contexto, sobrescritas);
  const respostaLogin = await autenticar(contexto, credenciais.email, credenciais.senha);
  const token = respostaLogin.body.tokenAcesso as string;

  const respostaConta = await requisicao(contexto).get('/contas/eu').set('Authorization', `Bearer ${token}`).expect(200);

  return {
    ...credenciais,
    id: respostaLogin.body.usuario.id as string,
    contaId: (respostaConta.body as ContaRespostaDto).id,
    token,
    autorizacao: `Bearer ${token}`,
    cookie: extrairCookieJwt(respostaLogin),
  };
}

export async function depositar(contexto: ContextoTeste, usuario: UsuarioTeste, valor: string): Promise<TransacaoRespostaDto> {
  const resposta = await requisicao(contexto).post('/transacoes/depositos').set('Authorization', usuario.autorizacao).send({ valor }).expect(201);

  return resposta.body as TransacaoRespostaDto;
}

export async function transferir(contexto: ContextoTeste, origem: UsuarioTeste, destino: UsuarioTeste, valor: string): Promise<TransacaoRespostaDto> {
  const resposta = await requisicao(contexto)
    .post('/transacoes/transferencias')
    .set('Authorization', origem.autorizacao)
    .send({ emailDestinatario: destino.email, valor })
    .expect(201);

  return resposta.body as TransacaoRespostaDto;
}

export async function estornar(contexto: ContextoTeste, usuario: UsuarioTeste, transacaoId: string): Promise<TransacaoRespostaDto> {
  const resposta = await requisicao(contexto).post(`/transacoes/${transacaoId}/estornos`).set('Authorization', usuario.autorizacao).expect(201);

  return resposta.body as TransacaoRespostaDto;
}

export async function obterConta(contexto: ContextoTeste, usuario: UsuarioTeste): Promise<ContaRespostaDto> {
  const resposta = await requisicao(contexto).get('/contas/eu').set('Authorization', usuario.autorizacao).expect(200);

  return resposta.body as ContaRespostaDto;
}

export async function obterSaldo(contexto: ContextoTeste, usuario: UsuarioTeste): Promise<string> {
  const conta = await obterConta(contexto, usuario);
  return conta.saldo;
}

export async function obterExtrato(contexto: ContextoTeste, usuario: UsuarioTeste, filtro: Record<string, string | number> = {}): Promise<ExtratoPaginadoDto> {
  const resposta = await requisicao(contexto).get('/transacoes').query(filtro).set('Authorization', usuario.autorizacao).expect(200);

  return resposta.body as ExtratoPaginadoDto;
}
