import { configuracaoTeste } from './configuracao-teste';

/**
 * Executado pelo Jest antes de cada arquivo de teste (`setupFiles`).
 *
 * O `ConfigModule` do Nest só preenche `process.env` com chaves ainda não
 * definidas, então sobrescrever aqui garante que o AppModule aponte para o banco
 * de teste — e nunca para o banco de desenvolvimento do `.env`.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = configuracaoTeste.host;
process.env.DATABASE_PORT = String(configuracaoTeste.porta);
process.env.DATABASE_USER = configuracaoTeste.usuario;
process.env.DATABASE_PASSWORD = configuracaoTeste.senha;
process.env.DATABASE_NAME = configuracaoTeste.bancoTeste;
process.env.JWT_SECRET = configuracaoTeste.segredoJwt;
process.env.JWT_EXPIRES_IN = configuracaoTeste.expiracaoJwt;
