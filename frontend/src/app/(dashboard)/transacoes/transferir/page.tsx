import type { Metadata } from 'next';
import { CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, TituloCartao } from '@/components/ui';
import { FormularioTransferencia } from '@/features/transacao/components/FormularioTransferencia';

export const metadata: Metadata = {
  title: 'Transferir | Carteira Financeira',
  description: 'Transfira valores para outra conta da carteira financeira',
};

export default function PaginaTransferir() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Transferir</h1>
        <p className="text-sm text-slate-600">Envie saldo para outro usuario pelo e-mail dele.</p>
      </div>

      <Cartao className="max-w-md">
        <CabecalhoCartao>
          <TituloCartao>Nova transferencia</TituloCartao>
          <DescricaoCartao>Informe o destinatario e o valor a ser enviado.</DescricaoCartao>
        </CabecalhoCartao>

        <ConteudoCartao>
          <FormularioTransferencia />
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}
