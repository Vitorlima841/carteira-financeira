'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { criarClienteConsulta } from './cliente-consulta';

/**
 * Disponibiliza o React Query para a arvore de Client Components.
 *
 * O cliente nasce dentro de `useState` para sobreviver a re-renders sem
 * virar singleton de modulo — que, no servidor, seria compartilhado entre
 * requisicoes de usuarios diferentes.
 */
export function ProvedorReactQuery({ children }: { children: ReactNode }) {
  const [clienteConsulta] = useState(criarClienteConsulta);

  return <QueryClientProvider client={clienteConsulta}>{children}</QueryClientProvider>;
}
