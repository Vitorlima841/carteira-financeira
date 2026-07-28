'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { criarClienteConsulta } from './cliente-consulta';

export function ProvedorReactQuery({ children }: { children: ReactNode }) {
  const [clienteConsulta] = useState(criarClienteConsulta);

  return <QueryClientProvider client={clienteConsulta}>{children}</QueryClientProvider>;
}
