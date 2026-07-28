'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'fantasma';
export type TamanhoBotao = 'sm' | 'md' | 'lg';

const CLASSES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const CLASSES_VARIANTE: Record<VarianteBotao, string> = {
  primario: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600',
  secundario: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400',
  perigo: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  fantasma: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
};

const CLASSES_TAMANHO: Record<TamanhoBotao, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export interface BotaoProps extends ComponentPropsWithRef<'button'> {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  carregando?: boolean;
  larguraTotal?: boolean;
}

function IndicadorCarregamento() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

export function Botao({ variante = 'primario', tamanho = 'md', carregando = false, larguraTotal = false, disabled, type = 'button', className, children, ...props }: BotaoProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(CLASSES_BASE, CLASSES_VARIANTE[variante], CLASSES_TAMANHO[tamanho], larguraTotal && 'w-full', className)}
      {...props}
    >
      {carregando && <IndicadorCarregamento />}
      {children}
    </button>
  );
}
