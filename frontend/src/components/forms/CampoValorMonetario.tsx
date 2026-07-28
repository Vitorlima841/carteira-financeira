'use client';

import { Campo, type CampoProps } from '@/components/ui';

export type CampoValorMonetarioProps = Omit<CampoProps, 'type' | 'inputMode'>;

export function CampoValorMonetario({
  rotulo = 'Valor',
  name = 'valor',
  placeholder = '0,00',
  dica = 'Use ate duas casas decimais. Exemplo: 150,00',
  ...props
}: CampoValorMonetarioProps) {
  return <Campo rotulo={rotulo} name={name} type="text" inputMode="decimal" autoComplete="off" placeholder={placeholder} dica={dica} {...props} />;
}
