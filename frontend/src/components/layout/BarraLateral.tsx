import Link from 'next/link';
import { ROTAS } from '@/constants/rotas';
import { BotaoSair } from '@/features/auth/components/BotaoSair';
import { cn } from '@/utils/cn';
import { NavegacaoPrincipal } from './NavegacaoPrincipal';

export interface BarraLateralProps {
  className?: string;
}

export function BarraLateral({ className }: BarraLateralProps) {
  return (
    <aside className={cn('w-60 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white px-4 py-6', className)}>
      <Link href={ROTAS.conta} className="px-3 text-lg font-semibold text-emerald-700">
        Carteira Financeira
      </Link>

      <NavegacaoPrincipal className="flex-1" />

      <BotaoSair />
    </aside>
  );
}
