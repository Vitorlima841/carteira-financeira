import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ProvedorReactQuery } from '@/lib/react-query/provedor-react-query';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carteira Financeira',
  description: 'Carteira financeira digital',
};

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ProvedorReactQuery>{children}</ProvedorReactQuery>
      </body>
    </html>
  );
}
