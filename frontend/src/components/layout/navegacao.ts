import { ROTAS } from '@/constants/rotas';

export interface ItemNavegacao {
  rotulo: string;
  href: string;
  /** Marca o item como ativo apenas no caminho exato, evitando conflito com as rotas filhas. */
  exato?: boolean;
}

export const ITENS_NAVEGACAO: readonly ItemNavegacao[] = [
  { rotulo: 'Conta', href: ROTAS.conta },
  { rotulo: 'Depositar', href: ROTAS.depositar },
  { rotulo: 'Transferir', href: ROTAS.transferir },
  { rotulo: 'Extrato', href: ROTAS.transacoes, exato: true },
  { rotulo: 'Perfil', href: ROTAS.perfil },
];

export function ehItemAtivo({ href, exato }: ItemNavegacao, caminhoAtual: string): boolean {
  if (exato) {
    return caminhoAtual === href;
  }

  return caminhoAtual === href || caminhoAtual.startsWith(`${href}/`);
}
