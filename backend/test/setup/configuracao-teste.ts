import { config } from 'dotenv';

// Carrega o .env do projeto para reaproveitar as credenciais do PostgreSQL local/docker-compose.
config();

const BANCO_TESTE_PADRAO = 'carteira_financeira_teste';

/**
 * Configuração compartilhada entre o `globalSetup` (que prepara o banco) e o
 * `setupFiles` (que injeta as variáveis de ambiente lidas pelo AppModule).
 *
 * `bancoAplicacao` é o banco de desenvolvimento declarado no `.env`; ele é usado
 * apenas para garantir que os testes nunca apaguem o banco de trabalho.
 */
export const configuracaoTeste = {
  host: process.env.DATABASE_HOST ?? 'localhost',
  porta: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,
  usuario: process.env.DATABASE_USER ?? 'carteira',
  senha: process.env.DATABASE_PASSWORD ?? 'carteira',
  bancoAplicacao: process.env.DATABASE_NAME,
  bancoTeste: process.env.DATABASE_TEST_NAME ?? BANCO_TESTE_PADRAO,
  bancoAdministrativo: process.env.DATABASE_ADMIN_NAME ?? 'postgres',
  segredoJwt: process.env.JWT_SECRET ?? 'segredo-de-teste',
  expiracaoJwt: process.env.JWT_EXPIRES_IN ?? '15m',
};
