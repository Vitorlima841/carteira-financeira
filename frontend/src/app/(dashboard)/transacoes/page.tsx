import type { Metadata } from 'next';
import Link from 'next/link';
import { Alerta, CabecalhoCartao, Cartao, ConteudoCartao, DescricaoCartao, RodapeCartao, TituloCartao } from '@/components/ui';
import { ROTAS } from '@/constants/rotas';
import { obterContaDoUsuario } from '@/features/conta/services/conta-servico';
import { BotaoEstorno } from '@/features/transacao/components/BotaoEstorno';
import { podeEstornar } from '@/features/transacao/regras';
import { CLASSES_STATUS, ROTULOS_STATUS, ROTULOS_TIPO } from '@/features/transacao/rotulos';
import { listarExtrato } from '@/features/transacao/services/transacao-servico';
import { converterParaErroApi } from '@/lib/api/erros';
import type { ExtratoPaginado, Transacao } from '@/types/transacao';
import { formatarDataHora } from '@/utils/data';
import { formatarMoeda } from '@/utils/moeda';

export const metadata: Metadata = {
  title: 'Extrato | Carteira Financeira',
  description: 'Historico de transacoes da sua carteira financeira',
};

const CLASSES_LINK_PAGINA = 'inline-flex h-8 items-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50';

const CLASSES_LINK_DESABILITADO = 'inline-flex h-8 items-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400';

interface PaginaExtratoProps {
  searchParams: Promise<{ pagina?: string }>;
}

function resolverPagina(valor: string | undefined): number {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : 1;
}

// Sem a conta carregada nao da para dizer de que lado o usuario esta na transacao.
function resolverSinal(transacao: Transacao, contaId: string | undefined): '+' | '-' | undefined {
  if (!contaId) {
    return undefined;
  }

  if (transacao.contaDestinoId === contaId) {
    return '+';
  }

  return transacao.contaOrigemId === contaId ? '-' : undefined;
}

function ValorTransacao({ transacao, contaId, moeda }: { transacao: Transacao; contaId?: string; moeda?: string }) {
  const sinal = resolverSinal(transacao, contaId);
  const cor = sinal === '+' ? 'text-emerald-700' : sinal === '-' ? 'text-red-700' : 'text-slate-900';

  return (
    <span className={`font-medium ${cor}`}>
      {sinal ? `${sinal} ` : ''}
      {formatarMoeda(transacao.valor, moeda)}
    </span>
  );
}

export default async function PaginaExtrato({ searchParams }: PaginaExtratoProps) {
  const { pagina } = await searchParams;
  const paginaAtual = resolverPagina(pagina);

  let extrato: ExtratoPaginado | null = null;
  let mensagemErro: string | undefined;

  try {
    extrato = await listarExtrato({ pagina: paginaAtual });
  } catch (erro) {
    mensagemErro = converterParaErroApi(erro).message;
  }

  // A chamada e deduplicada com a do layout pelo cache do React: serve so para marcar entradas e saidas.
  const conta = await obterContaDoUsuario().catch(() => null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Extrato</h1>
        <p className="text-sm text-slate-600">Historico das transacoes da sua carteira.</p>
      </div>

      {mensagemErro && <Alerta variante="erro">{mensagemErro}</Alerta>}

      {extrato && (
        <Cartao>
          <CabecalhoCartao>
            <TituloCartao>Transacoes</TituloCartao>
            <DescricaoCartao>
              {extrato.total === 0 ? 'Nenhuma transacao registrada ate agora.' : `${extrato.total} transacao(oes) encontrada(s).`}
            </DescricaoCartao>
          </CabecalhoCartao>

          <ConteudoCartao className="px-0 py-0">
            {extrato.dados.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-500">
                {extrato.total === 0 ? (
                  <>
                    Voce ainda nao movimentou a carteira.{' '}
                    <Link href={ROTAS.depositar} className="font-medium text-emerald-700 hover:underline">
                      Faca um deposito
                    </Link>{' '}
                    para comecar.
                  </>
                ) : (
                  <>
                    Nenhuma transacao nesta pagina.{' '}
                    <Link href={ROTAS.transacoes} className="font-medium text-emerald-700 hover:underline">
                      Voltar ao inicio do extrato
                    </Link>
                    .
                  </>
                )}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 text-left text-slate-500">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Tipo
                      </th>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Acoes
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {extrato.dados.map((transacao) => (
                      <tr key={transacao.id}>
                        <td className="whitespace-nowrap px-6 py-3 text-slate-600">{formatarDataHora(transacao.criadoEm)}</td>
                        <td className="whitespace-nowrap px-6 py-3 text-slate-900">{ROTULOS_TIPO[transacao.tipo]}</td>
                        <td className="whitespace-nowrap px-6 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CLASSES_STATUS[transacao.status]}`}>{ROTULOS_STATUS[transacao.status]}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right">
                          <ValorTransacao transacao={transacao} contaId={conta?.id} moeda={conta?.moeda} />
                        </td>
                        <td className="px-6 py-3 text-right">{podeEstornar(transacao) && <BotaoEstorno transacaoId={transacao.id} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ConteudoCartao>

          {extrato.totalPaginas > 1 && (
            <RodapeCartao className="justify-between">
              <span className="text-sm text-slate-500">
                Pagina {extrato.pagina} de {extrato.totalPaginas}
              </span>

              <div className="flex items-center gap-2">
                {extrato.pagina > 1 ? (
                  <Link href={`${ROTAS.transacoes}?pagina=${extrato.pagina - 1}`} className={CLASSES_LINK_PAGINA}>
                    Anterior
                  </Link>
                ) : (
                  <span className={CLASSES_LINK_DESABILITADO}>Anterior</span>
                )}

                {extrato.pagina < extrato.totalPaginas ? (
                  <Link href={`${ROTAS.transacoes}?pagina=${extrato.pagina + 1}`} className={CLASSES_LINK_PAGINA}>
                    Proxima
                  </Link>
                ) : (
                  <span className={CLASSES_LINK_DESABILITADO}>Proxima</span>
                )}
              </div>
            </RodapeCartao>
          )}
        </Cartao>
      )}
    </div>
  );
}
