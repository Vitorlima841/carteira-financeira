'use client';

import { useId, type ComponentPropsWithRef } from 'react';
import { cn } from '@/utils/cn';

const CLASSES_BASE =
  'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

const CLASSES_NORMAL = 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/30';
const CLASSES_ERRO = 'border-red-500 focus:border-red-600 focus:ring-red-600/30';

export interface CampoProps extends ComponentPropsWithRef<'input'> {
  rotulo?: string;
  dica?: string;
  erro?: string;
}

export function Campo({ rotulo, dica, erro, id, className, ...props }: CampoProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idMensagem = `${idCampo}-mensagem`;
  const temMensagem = Boolean(erro ?? dica);

  return (
    <div className="flex flex-col gap-1.5">
      {rotulo && (
        <label htmlFor={idCampo} className="text-sm font-medium text-slate-700">
          {rotulo}
        </label>
      )}

      <input
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={temMensagem ? idMensagem : undefined}
        className={cn(CLASSES_BASE, erro ? CLASSES_ERRO : CLASSES_NORMAL, className)}
        {...props}
      />

      {temMensagem && (
        <p id={idMensagem} className={cn('text-xs', erro ? 'text-red-600' : 'text-slate-500')} role={erro ? 'alert' : undefined}>
          {erro ?? dica}
        </p>
      )}
    </div>
  );
}
