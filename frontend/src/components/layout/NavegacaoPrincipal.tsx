'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ITENS_NAVEGACAO, ehItemAtivo } from './navegacao';

export type OrientacaoNavegacao = 'vertical' | 'horizontal';

const CLASSES_ORIENTACAO: Record<OrientacaoNavegacao, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row overflow-x-auto',
};

export interface NavegacaoPrincipalProps {
  orientacao?: OrientacaoNavegacao;
  className?: string;
}

export function NavegacaoPrincipal({ orientacao = 'vertical', className }: NavegacaoPrincipalProps) {
  const caminhoAtual = usePathname();

  return (
    <nav aria-label="Navegacao principal" className={className}>
      <ul className={cn('flex gap-1', CLASSES_ORIENTACAO[orientacao])}>
        {ITENS_NAVEGACAO.map((item) => {
          const ativo = ehItemAtivo(item, caminhoAtual);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className={cn(
                  'block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  ativo ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
