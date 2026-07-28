import type { Metadata } from 'next';
import Link from 'next/link';
import { CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, RodapeCartao, TituloCartao } from '@/components/ui';
import { ROTAS } from '@/constants/rotas';
import { FormularioCadastro } from '@/features/usuario/components/FormularioCadastro';

export const metadata: Metadata = {
  title: 'Criar conta | Carteira Financeira',
  description: 'Cadastre-se para usar a carteira financeira digital',
};

export default function PaginaRegistro() {
  return (
    <Cartao>
      <CabecalhoCartao>
        <TituloCartao>Criar conta</TituloCartao>
        <DescricaoCartao>Cadastre-se para comecar a usar sua carteira.</DescricaoCartao>
      </CabecalhoCartao>

      <ConteudoCartao>
        <FormularioCadastro />
      </ConteudoCartao>

      <RodapeCartao>
        <p className="text-sm text-slate-600">
          Ja tem uma conta?{' '}
          <Link href={ROTAS.login} className="font-medium text-emerald-700 hover:underline">
            Entrar
          </Link>
        </p>
      </RodapeCartao>
    </Cartao>
  );
}
