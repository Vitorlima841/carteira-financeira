import axios from 'axios';
import type { CodigoErro, RespostaErroApi } from '@/types/api';

const MENSAGEM_PADRAO = 'Nao foi possivel concluir a operacao. Tente novamente.';

const MENSAGENS_POR_STATUS: Record<number, string> = {
  400: 'Requisicao invalida.',
  401: 'Sessao expirada. Entre novamente para continuar.',
  403: 'Voce nao tem permissao para executar esta acao.',
  404: 'Recurso nao encontrado.',
  409: 'A operacao conflita com o estado atual do recurso.',
  422: 'Nao foi possivel processar a operacao.',
  500: 'Erro interno no servidor.',
};

export interface ErroApiSerializado {
  status: number;
  codigo: CodigoErro;
  mensagem: string;
  mensagens: string[];
}

interface DadosErroApi {
  status: number;
  codigo: CodigoErro;
  mensagens: string[];
}

export class ErroApi extends Error {
  readonly status: number;
  readonly codigo: CodigoErro;
  readonly mensagens: string[];

  constructor({ status, codigo, mensagens }: DadosErroApi) {
    const lista = mensagens.length > 0 ? mensagens : [MENSAGEM_PADRAO];
    super(lista[0]);
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo;
    this.mensagens = lista;
  }

  get ehErroDeCliente(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get ehNaoAutenticado(): boolean {
    return this.status === 401;
  }

  paraObjetoSimples(): ErroApiSerializado {
    return {
      status: this.status,
      codigo: this.codigo,
      mensagem: this.message,
      mensagens: this.mensagens,
    };
  }
}

export function ehErroApi(erro: unknown): erro is ErroApi {
  return erro instanceof ErroApi;
}

function ehRespostaErroApi(dados: unknown): dados is RespostaErroApi {
  if (typeof dados !== 'object' || dados === null) {
    return false;
  }

  const { mensagem } = dados as RespostaErroApi;
  return typeof mensagem === 'string' || Array.isArray(mensagem);
}

function normalizarMensagens(mensagem: string | string[]): string[] {
  const lista = Array.isArray(mensagem) ? mensagem : [mensagem];
  return lista.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function mensagemPorStatus(status: number): string {
  return MENSAGENS_POR_STATUS[status] ?? MENSAGEM_PADRAO;
}

function codigoPorStatus(status: number, mensagemOriginal: string | string[]): CodigoErro {
  return status === 400 && Array.isArray(mensagemOriginal) ? 'ERRO_DE_VALIDACAO' : 'ERRO_HTTP';
}

export function converterParaErroApi(erro: unknown): ErroApi {
  if (ehErroApi(erro)) {
    return erro;
  }

  if (axios.isCancel(erro)) {
    return new ErroApi({
      status: 0,
      codigo: 'REQUISICAO_CANCELADA',
      mensagens: ['A requisicao foi cancelada.'],
    });
  }

  if (axios.isAxiosError(erro)) {
    const resposta = erro.response;

    if (!resposta) {
      const tempoEsgotado = erro.code === 'ECONNABORTED' || erro.code === 'ETIMEDOUT';
      return new ErroApi({
        status: 0,
        codigo: tempoEsgotado ? 'TEMPO_ESGOTADO' : 'ERRO_DE_REDE',
        mensagens: [tempoEsgotado ? 'O servidor demorou para responder. Tente novamente.' : 'Nao foi possivel conectar ao servidor. Verifique sua conexao.'],
      });
    }

    if (ehRespostaErroApi(resposta.data)) {
      const corpo = resposta.data;
      const status = typeof corpo.statusCode === 'number' ? corpo.statusCode : resposta.status;
      const mensagens = normalizarMensagens(corpo.mensagem);

      return new ErroApi({
        status,
        codigo: (corpo.codigo as CodigoErro | undefined) ?? codigoPorStatus(status, corpo.mensagem),
        mensagens: mensagens.length > 0 ? mensagens : [mensagemPorStatus(status)],
      });
    }

    return new ErroApi({
      status: resposta.status,
      codigo: 'ERRO_HTTP',
      mensagens: [mensagemPorStatus(resposta.status)],
    });
  }

  return new ErroApi({
    status: 0,
    codigo: 'ERRO_DESCONHECIDO',
    mensagens: [erro instanceof Error && erro.message ? erro.message : MENSAGEM_PADRAO],
  });
}
