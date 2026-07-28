import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

/** Placeholder de carregamento. Dimensione via `className` (ex.: `h-4 w-32`). */
export function Skeleton({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-slate-200', className)} {...props} />;
}
