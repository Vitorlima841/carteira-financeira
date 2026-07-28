import { BotaoSair } from '@/features/auth/components/BotaoSair';
import type { Conta } from '@/features/conta/types';
import { formatarMoeda } from '@/utils/moeda';
import { NavegacaoPrincipal } from './NavegacaoPrincipal';

const ROTULO_USUARIO_PADRAO = 'Minha conta';
const SALDO_INDISPONIVEL = 'Indisponivel';

export interface CabecalhoProps {
  nomeUsuario?: string;
  conta: Conta | null;
}

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return '?';
  }

  const inicial = partes[0][0];
  const finalizacao = partes.length > 1 ? partes[partes.length - 1][0] : '';

  return `${inicial}${finalizacao}`.toUpperCase();
}

export function Cabecalho({ nomeUsuario, conta }: CabecalhoProps) {
  const nome = nomeUsuario?.trim() || ROTULO_USUARIO_PADRAO;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Saldo disponivel</p>
          <p className="text-2xl font-semibold text-slate-900">{conta ? formatarMoeda(conta.saldo, conta.moeda) : SALDO_INDISPONIVEL}</p>
        </div>

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
            {obterIniciais(nome)}
          </span>
          <span className="text-sm font-medium text-slate-900">{nome}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 px-2 py-2 md:hidden">
        <NavegacaoPrincipal orientacao="horizontal" className="min-w-0 flex-1" />
        <BotaoSair tamanho="sm" />
      </div>
    </header>
  );
}
