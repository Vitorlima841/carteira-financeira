# Carteira Financeira — Backend

API REST da carteira financeira digital, construída em **NestJS + TypeScript**, com persistência em **PostgreSQL** via **TypeORM**. Modela contas e transações como um **livro-razão de partida dobrada** (double-entry ledger): todo depósito ou transferência gera lançamentos (`débito`/`crédito`) balanceados, o que torna o saldo sempre auditável a partir do histórico.

## Tecnologias utilizadas

- **NestJS 10** + **TypeScript** — framework e organização em módulos/serviços/controllers.
- **PostgreSQL** + **TypeORM** — persistência relacional e migrations.
- **Passport + JWT** (`@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`) — autenticação stateless via access token.
- **class-validator** / **class-transformer** — validação e transformação de DTOs.
- **decimal.js** — aritmética monetária sem erros de ponto flutuante.
- **bcrypt** — hash de senhas.
- **Swagger** (`@nestjs/swagger`) — documentação interativa da API.
- **Jest** + **Supertest** — testes unitários e e2e.
- **Docker** / **docker-compose** — containerização da API e do banco.

## Como rodar

### Opção 1 — Docker (API + banco)

```bash
docker-compose up -d
```

Sobe o Postgres e a API já com as migrations aplicadas automaticamente antes do `node dist/main` (ver `Dockerfile`). A API fica disponível em `http://localhost:3000`.

### Opção 2 — Node local (útil para desenvolvimento com hot-reload)

Requer um PostgreSQL acessível (pode ser só o serviço `postgres` do `docker-compose.yml`: `docker-compose up postgres`).

```bash
npm install
npm run migration:run
npm run start:dev
```

A API sobe em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/documentacao`.

## Arquitetura

- **`controller/`** — camada HTTP: recebe requests, valida via DTOs e delega aos serviços.
- **`service/<dominio>/`** — regras de negócio de cada domínio (`usuario`, `conta`, `transacao`, `auth`), organizadas em módulos NestJS.
- **`repository/`** — acesso a dados via TypeORM, isolando queries das entidades.
- **`model/<dominio>/`** — entidades TypeORM, DTOs, enums, interfaces e erros de domínio específicos de cada área.
- **`shared/`** — infraestrutura transversal: configuração (`config/`), guards e decorators de autenticação (`guards/`, `decorators/`), filtro global de exceções (`filters/`), migrations (`migrations/`) e a `UnidadeTrabalhoService` (`database/`), que envolve operações em transações de banco (`DataSource.transaction`) para garantir atomicidade entre a criação da transação e seus lançamentos.

### Modelo de dados (ledger de partida dobrada)

- **`Usuario`** possui uma **`Conta`** (saldo em uma moeda).
- Toda **`Transacao`** (depósito, transferência ou estorno) gera um ou mais **`Lancamento`**s vinculados às contas envolvidas, cada um com uma `direcao` (`DEBITO`/`CREDITO`) e um valor.
- Depósitos geram um único lançamento de crédito; transferências geram um débito na conta de origem e um crédito na conta de destino, ambos dentro da mesma transação de banco; estornos criam uma nova transação com lançamentos invertidos, preservando o histórico da transação original (não há edição/exclusão retroativa).
- Autenticação é feita por **JWT** enviado tanto via header `Authorization: Bearer` quanto via cookie httpOnly (`jwt_token`), lido pela `JwtStrategy` e validado pelo `JwtAuthGuard` global (rotas marcadas com `@Public()` são liberadas).

## Funcionalidades

| Recurso | Endpoint | Descrição |
| --- | --- | --- |
| Cadastro de usuário | `POST /usuarios` | Cria usuário e sua conta associada. |
| Login | `POST /auth/login` | Autentica e retorna o token de acesso (também setado como cookie). |
| Logout | `POST /auth/logout` | Remove o cookie de sessão. |
| Consultar conta | `GET /contas/eu` | Saldo e dados da conta do usuário autenticado. |
| Depósito | `POST /transacoes/depositos` | Credita um valor na conta do usuário autenticado. |
| Transferência | `POST /transacoes/transferencias` | Debita da conta do usuário autenticado e credita a conta de destino. |
| Estorno | `POST /transacoes/:id/estornos` | Reverte uma transação da qual o usuário participou. |
| Extrato | `GET /transacoes` | Lista paginada e filtrável das transações da conta. |
| Detalhe da transação | `GET /transacoes/:id` | Detalha uma transação e seus lançamentos. |

A lista completa de contratos (schemas de request/response e códigos de erro) está na documentação Swagger em `/documentacao`.

## Testes de integração

Os testes de `test/` sobem o **AppModule completo** (mesmos `ValidationPipe`, filtro de exceções, guard JWT e cookie-parser do `main.ts`) e exercitam a API por HTTP, com **PostgreSQL real** — sem mocks de banco ou de repositório. Isso cobre o que testes unitários não alcançam: transações de banco, locks pessimistas, constraints, precisão `numeric(18,2)` e o contrato HTTP de ponta a ponta.

```bash
docker-compose up -d postgres
npm run test:e2e
```

O banco de teste (`DATABASE_TEST_NAME`, por padrão `carteira_financeira_teste`) é criado automaticamente, tem o schema recriado do zero e recebe todas as migrations antes da suíte; cada teste começa com as tabelas truncadas. Há uma trava que aborta a execução caso o banco de teste seja o mesmo do `.env`.

| Suíte | Cobertura |
| --- | --- |
| `usuarios.e2e-spec.ts` | Cadastro, criação automática da conta, hash da senha, e-mail duplicado e validação de DTO. |
| `auth.e2e-spec.ts` | Login, conteúdo do JWT, cookie httpOnly, logout e acesso a rotas protegidas por header/cookie. |
| `contas.e2e-spec.ts` | Consulta de saldo e isolamento entre contas. |
| `transacoes-deposito.e2e-spec.ts` | Crédito em conta, precisão decimal e recusa de valores inválidos. |
| `transacoes-transferencia.e2e-spec.ts` | Débito/crédito, saldo insuficiente, destinatário inválido e **concorrência** (duas transferências simultâneas não gastam o mesmo saldo). |
| `transacoes-estorno.e2e-spec.ts` | Reversão de depósito e transferência, transações não reversíveis e controle de acesso. |
| `transacoes-consulta.e2e-spec.ts` | Extrato paginado/filtrado e detalhe da transação com lançamentos. |
| `livro-razao.e2e-spec.ts` | Invariantes contábeis: `saldo_cache` = créditos − débitos, conservação do dinheiro e imutabilidade dos lançamentos. |

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run start:dev` | Servidor de desenvolvimento com watch/hot-reload. |
| `npm run build` | Build de produção (`dist/`). |
| `npm run start:prod` | Executa o build de produção. |
| `npm run lint` | ESLint com auto-fix. |
| `npm run format` | Formata `src/` com Prettier. |
| `npm test` | Testes unitários (Jest). |
| `npm run test:e2e` | Testes de integração (API + PostgreSQL real). |
| `npm run test:cov` | Testes com relatório de cobertura. |
| `npm run migration:generate` | Gera uma nova migration a partir das entidades. |
| `npm run migration:run` | Aplica as migrations pendentes. |
| `npm run migration:revert` | Reverte a última migration aplicada. |

## Variáveis de ambiente

Ver `.env.example`: porta e ambiente da aplicação, credenciais do PostgreSQL e segredos/expiração dos tokens JWT (access e refresh).
