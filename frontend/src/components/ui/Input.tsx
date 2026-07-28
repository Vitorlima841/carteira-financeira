'use client';

import { useId, type ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

const CLASSES_BASE =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const CLASSES_NORMAL = 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/30';
const CLASSES_ERRO = 'border-red-500 focus:border-red-600 focus:ring-red-600/30';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: string;
  /** Texto de apoio; some quando ha `error`. */
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, id, className, ...props }: InputProps) {
  const idGerado = useId();
  const idInput = id ?? idGerado;
  const idMensagem = `${idInput}-mensagem`;
  const temMensagem = Boolean(error ?? hint);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={idInput} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        id={idInput}
        aria-invalid={error ? true : undefined}
        aria-describedby={temMensagem ? idMensagem : undefined}
        className={cn(CLASSES_BASE, error ? CLASSES_ERRO : CLASSES_NORMAL, className)}
        {...props}
      />

      {temMensagem && (
        <p id={idMensagem} className={cn('text-xs', error ? 'text-red-600' : 'text-slate-500')} role={error ? 'alert' : undefined}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
