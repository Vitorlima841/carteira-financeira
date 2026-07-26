import { IContaRepositorio } from '../../modulos/carteira/dominio/repositorios/conta.repositorio.interface';
import { ITransacaoRepositorio } from '../../modulos/carteira/dominio/repositorios/transacao.repositorio.interface';
import { IUsuarioRepositorio } from '../../modulos/usuarios/dominio/repositorios/usuario.repositorio.interface';

export interface IContextoTransacional {
  contaRepositorio: IContaRepositorio;
  transacaoRepositorio: ITransacaoRepositorio;
  usuarioRepositorio: IUsuarioRepositorio;
}

export interface IUnidadeDeTrabalho {
  executar<T>(trabalho: (contexto: IContextoTransacional) => Promise<T>): Promise<T>;
}

export const UNIDADE_DE_TRABALHO = Symbol('UNIDADE_DE_TRABALHO');
