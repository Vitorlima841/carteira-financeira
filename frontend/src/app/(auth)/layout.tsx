import Link from 'next/link';
import type { ReactNode } from 'react';
import { ROTAS } from '@/constants/rotas';

export default function LayoutAutenticacao({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href={ROTAS.inicio} className="text-lg font-semibold text-emerald-700">
        Carteira Financeira
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
