import { redirect } from 'next/navigation';
import { resolverRotaInicial } from '@/constants/rotas';
import { possuiSessao } from '@/features/auth/services/sessao-servico';

// A raiz e apenas um ponto de entrada: o middleware ja redireciona, e este redirect
// garante o mesmo destino caso a requisicao chegue direto ao App Router.
export default async function PaginaInicial() {
  redirect(resolverRotaInicial(await possuiSessao()));
}
