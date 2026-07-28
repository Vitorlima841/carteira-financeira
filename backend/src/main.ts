import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { FiltroExcecaoHttp } from './shared/filters/filtro-excecao-http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new FiltroExcecaoHttp());

  const documentoSwagger = new DocumentBuilder()
    .setTitle('API Carteira Financeira')
    .setDescription('API de carteira financeira digital com livro-razão de partida dobrada (double-entry ledger)')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('jwt_token')
    .build();
  const documento = SwaggerModule.createDocument(app, documentoSwagger);
  SwaggerModule.setup('documentacao', app, documento);

  await app.listen(configService.get<number>('porta', 3001));
}
bootstrap();
