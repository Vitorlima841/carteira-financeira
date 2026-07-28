type ValorClasse = string | false | null | undefined;

/**
 * Junta classes CSS ignorando valores falsos.
 *
 * Nao resolve conflitos entre utilitarios do Tailwind (nao e `tailwind-merge`):
 * quando duas classes disputam a mesma propriedade, quem vence e a ordem do
 * CSS gerado, nao a ordem dos argumentos. Nos componentes de `components/ui`
 * o `className` recebido vem por ultimo apenas por convencao de leitura.
 */
export function cn(...classes: ValorClasse[]): string {
  return classes.filter(Boolean).join(' ');
}
