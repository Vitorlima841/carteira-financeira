import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Alerta, CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, RodapeCartao, TituloCartao } from '@/components/ui';
import { BotaoSair } from '@/features/auth/components/BotaoSair';
import { obterUsuarioDaSessao } from '@/features/auth/services/sessao-servico';
import { obterContaDoUsuario } from '@/features/conta/services/conta-servico';
import type { Conta } from '@/features/conta/types';
import { converterParaErroApi } from '@/lib/api/erros';
import { formatarMoeda } from '@/utils/moeda';

export const metadata: Metadata = {
  title: 'Perfil | Carteira Financeira',
  description: 'Dados da sua conta na carteira financeira',
};

function LinhaDado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default async function PaginaPerfil() {
  // O nome e o e-mail vem do cookie gravado no login: a API nao expoe um recurso de usuario logado.
  const usuario = await obterUsuarioDaSessao();

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
        <h1 className="text-xl font-semibold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-600">Seus dados de cadastro e da carteira.</p>
      </div>

      {mensagemErro && <Alerta variante="erro">{mensagemErro}</Alerta>}

      {!usuario && <Alerta variante="aviso">Nao foi possivel ler seus dados de cadastro. Entre novamente para atualizar a sessao.</Alerta>}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Cartao className="w-full lg:max-w-md">
          <CabecalhoCartao>
            <TituloCartao>Dados pessoais</TituloCartao>
            <DescricaoCartao>Informacoes registradas no seu cadastro.</DescricaoCartao>
          </CabecalhoCartao>

          <ConteudoCartao>
            <dl className="flex flex-col gap-2 text-sm">
              <LinhaDado rotulo="Nome">{usuario?.nome ?? '-'}</LinhaDado>
              <LinhaDado rotulo="E-mail">{usuario?.email ?? '-'}</LinhaDado>
            </dl>
          </ConteudoCartao>

          <RodapeCartao className="justify-between">
            <span className="text-sm text-slate-500">Encerrar a sessao neste dispositivo.</span>
            <BotaoSair tamanho="sm" />
          </RodapeCartao>
        </Cartao>

        <Cartao className="w-full lg:max-w-md">
          <CabecalhoCartao>
            <TituloCartao>Carteira</TituloCartao>
            <DescricaoCartao>Dados da conta usada nas transacoes.</DescricaoCartao>
          </CabecalhoCartao>

          <ConteudoCartao>
            {conta ? (
              <dl className="flex flex-col gap-2 text-sm">
                <LinhaDado rotulo="Saldo disponivel">
                  <span className="text-emerald-700">{formatarMoeda(conta.saldo, conta.moeda)}</span>
                </LinhaDado>
                <LinhaDado rotulo="Moeda">{conta.moeda}</LinhaDado>
                <LinhaDado rotulo="Identificador">
                  <span className="break-all font-mono text-xs text-slate-600">{conta.id}</span>
                </LinhaDado>
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Dados da carteira indisponiveis no momento.</p>
            )}
          </ConteudoCartao>
        </Cartao>
      </div>
    </div>
  );
}
