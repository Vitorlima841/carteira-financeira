# Carteira Financeira — Frontend

Interface web da carteira financeira digital, construída em **Next.js (App Router) + React + TypeScript + Tailwind CSS**, consumindo a API **NestJS** do diretório `backend/`.

> Estado atual: **infraestrutura base** pronta (cliente HTTP, tipos espelhando os DTOs do backend, React Query e design system em `components/ui`), **fluxo de autenticação** implementado (cadastro, login, logout e proteção de rotas) e telas iniciais de **conta** (consulta de saldo) e **transações** (depósito e transferência). Extrato, detalhe/estorno de transação e perfil ainda não têm tela — pastas ainda vazias são versionadas via `.gitkeep`.

## Tecnologias utilizadas

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** — estilização utilitária e design system em `components/ui`
- **TanStack React Query** — cache e sincronização de dados no client
- **Zustand** — estado global de UI
- **Axios** — clientes HTTP (servidor e browser)
- **ESLint + Prettier** — lint e formatação
- **Docker** — containerização (esqueleto, ver seção abaixo)

## Funcionalidades

- **Cadastro e login** de usuário, com sessão via cookie JWT httpOnly.
- **Logout** e **proteção de rotas**: `middleware.ts` redireciona quem não está autenticado para `/login` e quem já está logado para fora de `/login`/`/registro`.
- **Consulta de saldo** da conta do usuário autenticado.
- **Depósito** e **transferência** entre contas, via formulários que chamam Server Actions.
- Em falta (backend já expõe, frontend ainda não): **extrato** de transações, **detalhe/estorno** de uma transação e **perfil** do usuário.

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:3001` e espera o backend em `http://localhost:3000` (ver `.env.example`).

## Estrutura de pastas

| Pasta | Propósito |
| --- | --- |
| `public/` | Assets estáticos servidos na raiz do site (`icons/` para ícones e favicons). |
| `src/app/` | Rotas do App Router. Agrupadas em `(auth)` (login, registro) e `(dashboard)` (conta, transações, perfil) — route groups não aparecem na URL. `api/` guarda route handlers pontuais (webhooks, health check). |
| `src/components/` | Componentes compartilhados e agnósticos de domínio: `ui/` (design system), `layout/` (header, sidebar, footer) e `forms/` (inputs genéricos). |
| `src/features/` | Código organizado por domínio do backend (`auth`, `usuario`, `conta`, `transacao`). Cada um tem `actions/` (Server Actions `"use server"`), `components/`, `hooks/`, `services/` (acesso HTTP à API) e `types/`. |
| `src/hooks/` | Hooks React reutilizáveis que não pertencem a um domínio específico. |
| `src/lib/` | Integrações e configuração de bibliotecas. `api/` concentra os clientes HTTP da API NestJS e o parser de erros; `react-query/` guarda o `QueryClient` e o provider. |
| `src/contexts/` | React Contexts para estado de UI compartilhado (ex.: sessão do usuário, tema). |
| `src/store/` | Stores globais (Zustand) para estado de UI que não cabe em contexto local. |
| `src/types/` | Tipos e interfaces TypeScript transversais à aplicação. |
| `src/utils/` | Funções utilitárias puras (formatação de moeda, datas, validações). |
| `src/constants/` | Valores constantes: rotas, chaves de query, mensagens, enums de UI. |
| `src/styles/` | Estilos globais adicionais e tokens de tema além do `app/globals.css`. |
| `tests/` | Testes fora do código de produção: `unit/` (Jest + Testing Library) e `e2e/` (Playwright/Cypress). |

## Convenções

- **Mutações via Server Actions.** Cadastro, login, depósito, transferência e reversão ficam em `features/<dominio>/actions/` e chamam a API a partir do servidor, sem expor token nem lógica de integração ao client.
- **Leituras via services.** `features/<dominio>/services/` expõe funções puras de acesso à API, consumidas pelas actions no servidor e pelo React Query no client quando necessário.
- **Dois clientes HTTP.** `@/lib/api/cliente-servidor` roda no servidor (baseURL `API_URL`) e repassa o cookie httpOnly de sessão a mão; `@/lib/api/cliente-navegador` roda no browser (baseURL `NEXT_PUBLIC_API_URL`, `withCredentials`). Ambos normalizam falhas em `ErroApi`, que entende o formato `{ statusCode, codigo, mensagem }` do backend.
- **`src/middleware.ts`** protege as rotas de `(dashboard)`, redirecionando usuários sem sessão para `/login` e usuários autenticados para fora de `/login` e `/registro`.
- **Sessão em cookie httpOnly.** Como as Server Actions chamam a API de servidor para servidor, o `Set-Cookie` do Nest não chega ao browser: a action de login grava o cookie `SESSION_COOKIE_NAME` manualmente via `cookies()`, usando `tokenAcesso` e `expiraEm` do corpo da resposta.
- **Alias de import:** `@/*` aponta para `src/*`.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Build de produção. |
| `npm run start` | Serve o build de produção. |
| `npm run lint` | ESLint (config do Next + Prettier). |
| `npm run format` | Formata `src/` com Prettier. |
| `npm run type-check` | Checagem de tipos sem emitir arquivos. |

## Docker

O `Dockerfile` é um esqueleto de etapa única, alinhado ao `backend/`. O build multi-stage (com `output: 'standalone'`) e o serviço no `docker-compose` serão adicionados junto com a aplicação.
