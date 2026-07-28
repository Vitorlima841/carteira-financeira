'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type VariantButton = 'primary' | 'secondary' | 'danger' | 'ghost';
export type SizeButton = 'sm' | 'md' | 'lg';

const CLASSES_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const CLASSES_VARIANTE: Record<VariantButton, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
};

const CLASSES_TAMANHO: Record<SizeButton, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: VariantButton;
  size?: SizeButton;
  /** Exibe o spinner e bloqueia novos cliques. */
  isLoading?: boolean;
  fullWidth?: boolean;
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

export function Button({ variant = 'primary', size = 'md', isLoading = false, fullWidth = false, disabled, type = 'button', className, children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(CLASSES_BASE, CLASSES_VARIANTE[variant], CLASSES_TAMANHO[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
