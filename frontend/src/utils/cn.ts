type ValorClasse = string | false | null | undefined;

export function cn(...classes: ValorClasse[]): string {
  return classes.filter(Boolean).join(' ');
}
