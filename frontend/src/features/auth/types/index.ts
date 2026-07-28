import type { EstadoFormulario } from '@/types/formulario';

export type { CredenciaisLogin, RespostaAutenticacao } from '@/types/auth';

export type CampoLogin = 'email' | 'senha';

export type EstadoFormularioLogin = EstadoFormulario<CampoLogin>;
