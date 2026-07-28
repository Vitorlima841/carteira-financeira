'use client';

import { useFormStatus } from 'react-dom';
import { Botao, type TamanhoBotao, type VarianteBotao } from '@/components/ui';
import { sair } from '../actions/sessao';

interface BotaoSairProps {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
}

function BotaoEnvio({ variante, tamanho }: BotaoSairProps) {
  const { pending } = useFormStatus();

  return (
    <Botao type="submit" variante={variante} tamanho={tamanho} carregando={pending}>
      Sair
    </Botao>
  );
}

export function BotaoSair({ variante = 'secundario', tamanho = 'md' }: BotaoSairProps) {
  return (
    <form action={sair}>
      <BotaoEnvio variante={variante} tamanho={tamanho} />
    </form>
  );
}
