import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export function Esqueleto({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-slate-200', className)} {...props} />;
}
