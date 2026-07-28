import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type VariantAlert = 'info' | 'success' | 'warning' | 'error';

const CLASSES_VARIANTE: Record<VariantAlert, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  variant?: VariantAlert;
  title?: string;
}

export function Alert({ variant = 'info', title, className, children, ...props }: AlertProps) {
  const critico = variant === 'error';

  return (
    <div
      role={critico ? 'alert' : 'status'}
      aria-live={critico ? 'assertive' : 'polite'}
      className={cn('rounded-md border px-4 py-3 text-sm', CLASSES_VARIANTE[variant], className)}
      {...props}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn(title && 'mt-1')}>{children}</div>}
    </div>
  );
}
