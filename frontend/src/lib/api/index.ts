/**
 * Barrel apenas da parte agnostica de ambiente.
 *
 * Os clientes ficam de fora de proposito: `cliente-servidor` importa
 * `next/headers` e quebraria qualquer Client Component que caisse neste
 * barrel. Importe-os pelo caminho completo:
 *
 * - `@/lib/api/cliente-servidor` — Server Actions e Server Components
 * - `@/lib/api/cliente-navegador` — React Query e demais hooks de client
 */
export * from './config';
export * from './erros';
