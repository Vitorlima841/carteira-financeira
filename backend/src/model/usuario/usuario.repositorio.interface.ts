import {Usuario} from "./usuario.entity";

/**
 * Contrato de persistência para a entidade Usuario (Dependency
 * Inversion Principle: casos de uso dependem desta interface, nunca
 * de uma implementação concreta de banco de dados).
 */
export interface IUsuarioRepositorio {
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<void>;
}

export const USUARIO_REPOSITORIO = Symbol('USUARIO_REPOSITORIO');
