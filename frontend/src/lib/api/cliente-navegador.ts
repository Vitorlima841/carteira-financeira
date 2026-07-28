import axios, { type AxiosInstance } from 'axios';
import { TEMPO_LIMITE_REQUISICAO_MS, obterUrlApiNavegador } from './config';
import { converterParaErroApi } from './erros';

export const clienteApiNavegador: AxiosInstance = axios.create({
  baseURL: obterUrlApiNavegador(),
  timeout: TEMPO_LIMITE_REQUISICAO_MS,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

clienteApiNavegador.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => Promise.reject(converterParaErroApi(erro)),
);
