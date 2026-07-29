import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { FiltroExcecaoHttp } from '../../src/shared/filters/filtro-excecao-http';

export interface ContextoTeste {
  aplicacao: INestApplication;
  fonteDados: DataSource;
}

/**
 * Sobe a aplicação real (AppModule completo, ligado ao PostgreSQL de teste) com a
 * mesma configuração global do `main.ts`: cookie-parser, ValidationPipe e o filtro
 * de exceções. Sem mocks — o que os testes exercitam é o mesmo pipeline HTTP da API.
 */
export async function criarContextoTeste(): Promise<ContextoTeste> {
  const modulo: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const aplicacao = modulo.createNestApplication({ logger: false });

  aplicacao.use(cookieParser());
  aplicacao.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  aplicacao.useGlobalFilters(new FiltroExcecaoHttp());

  await aplicacao.init();

  return { aplicacao, fonteDados: aplicacao.get(DataSource) };
}

export async function encerrarContexto(contexto: ContextoTeste): Promise<void> {
  await contexto.aplicacao.close();
}

export function requisicao(contexto: ContextoTeste) {
  return request(contexto.aplicacao.getHttpServer());
}
