export type StatusFormulario = 'inativo' | 'sucesso' | 'erro';

export interface EstadoFormulario<TCampo extends string = string> {
  status: StatusFormulario;
  mensagem?: string;
  errosPorCampo?: Partial<Record<TCampo, string>>;
  valores?: Partial<Record<TCampo, string>>;
}
