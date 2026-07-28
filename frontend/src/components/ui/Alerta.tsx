import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

export type VarianteAlerta = 'info' | 'sucesso' | 'aviso' | 'erro';

const CLASSES_VARIANTE: Record<VarianteAlerta, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  sucesso: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  aviso: 'border-amber-200 bg-amber-50 text-amber-900',
  erro: 'border-red-200 bg-red-50 text-red-900',
};

export interface AlertaProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  variante?: VarianteAlerta;
  titulo?: string;
}

export function Alerta({ variante = 'info', titulo, className, children, ...props }: AlertaProps) {
  const critico = variante === 'erro';

  return (
    <div
      role={critico ? 'alert' : 'status'}
      aria-live={critico ? 'assertive' : 'polite'}
      className={cn('rounded-md border px-4 py-3 text-sm', CLASSES_VARIANTE[variante], className)}
      {...props}
    >
      {titulo && <p className="font-semibold">{titulo}</p>}
      {children && <div className={cn(titulo && 'mt-1')}>{children}</div>}
    </div>
  );
}
