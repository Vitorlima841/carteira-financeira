import type { Metadata } from 'next';
import { Alerta, CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, TituloCartao } from '@/components/ui';
import { obterContaDoUsuario } from '@/features/conta/services/conta-servico';
import type { Conta } from '@/features/conta/types';
import { converterParaErroApi } from '@/lib/api/erros';
import { formatarMoeda } from '@/utils/moeda';

export const metadata: Metadata = {
  title: 'Minha conta | Carteira Financeira',
  description: 'Saldo atual da sua carteira financeira',
};

export default async function PaginaConta() {
  let conta: Conta | null = null;
  let mensagemErro: string | undefined;

  try {
    // A chamada e deduplicada com a do layout pelo cache do React.
    conta = await obterContaDoUsuario();
  } catch (erro) {
    mensagemErro = converterParaErroApi(erro).message;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Minha conta</h1>
        <p className="text-sm text-slate-600">Acompanhe o saldo disponivel na sua carteira.</p>
      </div>

      {mensagemErro && <Alerta variante="erro">{mensagemErro}</Alerta>}

      {conta && (
        <Cartao className="max-w-md">
          <CabecalhoCartao>
            <TituloCartao>Saldo disponivel</TituloCartao>
            <DescricaoCartao>Valores em {conta.moeda}</DescricaoCartao>
          </CabecalhoCartao>

          <ConteudoCartao className="flex flex-col gap-4">
            <p className="text-3xl font-semibold text-emerald-700">{formatarMoeda(conta.saldo, conta.moeda)}</p>

            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Moeda</dt>
                <dd className="font-medium text-slate-900">{conta.moeda}</dd>
              </div>
            </dl>
          </ConteudoCartao>
        </Cartao>
      )}
    </div>
  );
}
