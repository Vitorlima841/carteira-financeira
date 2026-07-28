import { QueryClient } from '@tanstack/react-query';
import { ehErroApi } from '@/lib/api/erros';

const TENTATIVAS_MAXIMAS = 2;
const TEMPO_ATE_OBSOLETO_MS = 30_000;
const TEMPO_EM_CACHE_MS = 5 * 60_000;

/** Repetir 4xx nao muda o resultado — so 5xx e falha de rede valem retry. */
function deveTentarNovamente(contagemFalhas: number, erro: unknown): boolean {
  if (ehErroApi(erro) && erro.ehErroDeCliente) {
    return false;
  }

  return contagemFalhas < TENTATIVAS_MAXIMAS;
}

/**
 * Cria um `QueryClient` por sessao de navegacao.
 *
 * Nunca compartilhe uma instancia entre requisicoes no servidor: o cache
 * vazaria dados de um usuario para outro.
 */
export function criarClienteConsulta(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: TEMPO_ATE_OBSOLETO_MS,
        gcTime: TEMPO_EM_CACHE_MS,
        refetchOnWindowFocus: false,
        retry: deveTentarNovamente,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
