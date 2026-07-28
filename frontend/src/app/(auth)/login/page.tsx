import type { Metadata } from 'next';
import Link from 'next/link';
import { Alerta, CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, RodapeCartao, TituloCartao } from '@/components/ui';
import { PARAMETRO_CADASTRO, ROTAS, VALOR_CADASTRO_CONCLUIDO } from '@/constants/rotas';
import { FormularioLogin } from '@/features/auth/components/FormularioLogin';

export const metadata: Metadata = {
  title: 'Entrar | Carteira Financeira',
  description: 'Acesse sua carteira financeira digital',
};

interface PaginaLoginProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaLogin({ searchParams }: PaginaLoginProps) {
  const parametros = await searchParams;
  const cadastroConcluido = parametros[PARAMETRO_CADASTRO] === VALOR_CADASTRO_CONCLUIDO;

  return (
    <Cartao>
      <CabecalhoCartao>
        <TituloCartao>Entrar</TituloCartao>
        <DescricaoCartao>Informe seus dados para acessar sua carteira.</DescricaoCartao>
      </CabecalhoCartao>

      <ConteudoCartao className="flex flex-col gap-4">
        {cadastroConcluido && <Alerta variante="sucesso">Cadastro concluido. Entre com suas credenciais.</Alerta>}

        <FormularioLogin />
      </ConteudoCartao>

      <RodapeCartao>
        <p className="text-sm text-slate-600">
          Ainda nao tem conta?{' '}
          <Link href={ROTAS.registro} className="font-medium text-emerald-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </RodapeCartao>
    </Cartao>
  );
}
