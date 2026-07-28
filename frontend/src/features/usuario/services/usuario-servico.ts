import { clienteApiServidor } from '@/lib/api/cliente-servidor';
import type { CriarUsuarioPayload, Usuario } from '@/types/usuario';

const RECURSO_USUARIOS = '/usuarios';

export async function cadastrarUsuario(dados: CriarUsuarioPayload): Promise<Usuario> {
  const { data } = await clienteApiServidor.post<Usuario>(RECURSO_USUARIOS, dados);
  return data;
}
