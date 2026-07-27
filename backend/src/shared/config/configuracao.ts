export default () => ({
  ambiente: process.env.NODE_ENV || 'development',
  porta: parseInt(process.env.PORT ?? '', 10) || 3000,
  banco: {
    host: process.env.DATABASE_HOST,
    porta: parseInt(process.env.DATABASE_PORT ?? '', 10) || 5432,
    usuario: process.env.DATABASE_USER,
    senha: process.env.DATABASE_PASSWORD,
    nome: process.env.DATABASE_NAME,
  },
  jwt: {
    segredo: process.env.JWT_SECRET,
    expiraEm: process.env.JWT_EXPIRES_IN || '15m',
    segredoAtualizacao: process.env.JWT_REFRESH_SECRET,
    expiraEmAtualizacao: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});
