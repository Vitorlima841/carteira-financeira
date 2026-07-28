const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ehTextoPreenchido(valor: string): boolean {
  return valor.trim().length > 0;
}

export function ehEmailValido(valor: string): boolean {
  return PADRAO_EMAIL.test(valor);
}

export function obterTextoDoFormulario(dadosFormulario: FormData, campo: string): string {
  const valor = dadosFormulario.get(campo);
  return typeof valor === 'string' ? valor : '';
}
