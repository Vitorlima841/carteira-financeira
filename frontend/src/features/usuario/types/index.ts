import type { EstadoFormulario } from '@/types/formulario';

export type { CriarUsuarioPayload, Usuario } from '@/types/usuario';

export type CampoCadastro = 'nome' | 'email' | 'senha' | 'confirmarSenha';

export type EstadoFormularioCadastro = EstadoFormulario<CampoCadastro>;
