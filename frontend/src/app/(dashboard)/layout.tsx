import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { BarraLateral, Cabecalho } from '@/components/layout';
import { ROTAS } from '@/constants/rotas';
import { obterUsuarioDaSessao } from '@/features/auth/services/sessao-servico';
import { obterContaDoUsuario } from '@/features/conta/services/conta-servico';
import type { Conta } from '@/features/conta/types';
import { ehErroApi } from '@/lib/api/erros';

// O cabecalho nao deve derrubar o painel inteiro quando a API falha: sem sessao valida
// o usuario volta ao login, nos demais erros o saldo aparece como indisponivel.
async function carregarConta(): Promise<Conta | null> {
  try {
    return await obterContaDoUsuario();
  } catch (erro) {
    if (ehErroApi(erro) && erro.ehNaoAutenticado) {
      redirect(ROTAS.login);
    }

    return null;
  }
}

export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const [usuario, conta] = await Promise.all([obterUsuarioDaSessao(), carregarConta()]);

  return (
    <div className="flex min-h-screen">
      <BarraLateral className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Cabecalho nomeUsuario={usuario?.nome} conta={conta} />

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
