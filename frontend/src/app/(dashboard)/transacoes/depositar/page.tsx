import type { Metadata } from 'next';
import { CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, TituloCartao } from '@/components/ui';
import { FormularioDeposito } from '@/features/transacao/components/FormularioDeposito';

export const metadata: Metadata = {
  title: 'Depositar | Carteira Financeira',
  description: 'Deposite valores na sua carteira financeira',
};

export default function PaginaDepositar() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Depositar</h1>
        <p className="text-sm text-slate-600">Adicione saldo a sua carteira.</p>
      </div>

      <Cartao className="max-w-md">
        <CabecalhoCartao>
          <TituloCartao>Novo deposito</TituloCartao>
          <DescricaoCartao>Informe quanto deseja adicionar ao seu saldo.</DescricaoCartao>
        </CabecalhoCartao>

        <ConteudoCartao>
          <FormularioDeposito />
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}
