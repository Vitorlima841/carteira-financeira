import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export function Cartao({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)} {...props} />;
}

export function CabecalhoCartao({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('flex flex-col gap-1 border-b border-slate-100 px-6 py-4', className)} {...props} />;
}

export function TituloCartao({ className, ...props }: ComponentPropsWithRef<'h3'>) {
  return <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props} />;
}

export function DescricaoCartao({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />;
}

export function ConteudoCartao({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('px-6 py-4', className)} {...props} />;
}

export function RodapeCartao({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div className={cn('flex items-center gap-3 border-t border-slate-100 px-6 py-4', className)} {...props} />;
}
