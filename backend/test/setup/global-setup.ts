import { readdirSync } from 'fs';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { configuracaoTeste } from './configuracao-teste';

const DIRETORIO_MIGRATIONS = join(__dirname, '..', '..', 'src', 'shared', 'migrations');
const NOME_BANCO_VALIDO = /^[a-zA-Z0-9_]+$/;

function opcoesConexao(banco: string): DataSourceOptions {
  return {
    type: 'postgres',
    host: configuracaoTeste.host,
    port: configuracaoTeste.porta,
    username: configuracaoTeste.usuario,
    password: configuracaoTeste.senha,
    database: banco,
    entities: [],
    synchronize: false,
    logging: false,
  };
}

/** Executa comandos em uma conexão dedicada e sempre a encerra ao final. */
async function comConexao(banco: string, operacao: (fonteDados: DataSource) => Promise<void>): Promise<void> {
  const fonteDados = new DataSource(opcoesConexao(banco));
  await fonteDados.initialize();

  try {
    await operacao(fonteDados);
  } finally {
    await fonteDados.destroy();
  }
}

function carregarMigrations(): Function[] {
  return readdirSync(DIRETORIO_MIGRATIONS)
    .filter((arquivo) => arquivo.endsWith('.ts'))
    .sort()
    .flatMap((arquivo) => Object.values(require(join(DIRETORIO_MIGRATIONS, arquivo)) as Record<string, unknown>))
    .filter((exportado): exportado is Function => typeof exportado === 'function');
}

function validarDestino(): void {
  if (!NOME_BANCO_VALIDO.test(configuracaoTeste.bancoTeste)) {
    throw new Error(`Nome de banco de teste inválido: "${configuracaoTeste.bancoTeste}". Use apenas letras, números e "_".`);
  }

  if (configuracaoTeste.bancoTeste === configuracaoTeste.bancoAplicacao) {
    throw new Error(
      `O banco de teste ("${configuracaoTeste.bancoTeste}") é o mesmo declarado no .env. ` +
        'Defina DATABASE_TEST_NAME apontando para um banco dedicado — os testes recriam o schema do zero.',
    );
  }
}

async function garantirBancoDeTeste(): Promise<void> {
  try {
    await comConexao(configuracaoTeste.bancoAdministrativo, async (fonteDados) => {
      const existentes = await fonteDados.query('SELECT 1 FROM pg_database WHERE datname = $1', [configuracaoTeste.bancoTeste]);

      if (existentes.length === 0) {
        await fonteDados.query(`CREATE DATABASE "${configuracaoTeste.bancoTeste}"`);
      }
    });
  } catch (erro) {
    throw new Error(
      `Não foi possível preparar o banco de teste em ${configuracaoTeste.host}:${configuracaoTeste.porta}. ` +
        'Suba o PostgreSQL com "docker-compose up -d postgres" antes de rodar os testes de integração. ' +
        `Detalhe: ${(erro as Error).message}`,
    );
  }
}

async function recriarEsquemaComMigrations(): Promise<void> {
  await comConexao(configuracaoTeste.bancoTeste, async (fonteDados) => {
    await fonteDados.query('DROP SCHEMA IF EXISTS public CASCADE');
    await fonteDados.query('CREATE SCHEMA public');
    await fonteDados.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  });

  const fonteDados = new DataSource({
    ...opcoesConexao(configuracaoTeste.bancoTeste),
    migrations: carregarMigrations(),
  });

  await fonteDados.initialize();
  try {
    await fonteDados.runMigrations();
  } finally {
    await fonteDados.destroy();
  }
}

/**
 * Prepara o banco de integração uma única vez por execução do Jest: cria o banco
 * dedicado (se ainda não existir), zera o schema e aplica todas as migrations do
 * projeto. Assim os testes rodam contra exatamente o mesmo schema de produção.
 */
export default async function configurarBancoDeIntegracao(): Promise<void> {
  validarDestino();
  await garantirBancoDeTeste();
  await recriarEsquemaComMigrations();
}
