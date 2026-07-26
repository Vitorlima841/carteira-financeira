import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { FiltroExcecaoHttp } from './compartilhado/filtros/filtro-excecao-http';
import { InterceptadorLog } from './compartilhado/interceptadores/interceptador-log';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new FiltroExcecaoHttp());
  app.useGlobalInterceptors(new InterceptadorLog());

  const documentoSwagger = new DocumentBuilder()
    .setTitle('API Carteira Financeira')
    .setDescription(
      'API de carteira financeira digital com livro-razão de partida dobrada (double-entry ledger)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documento = SwaggerModule.createDocument(app, documentoSwagger);
  SwaggerModule.setup('documentacao', app, documento);

  await app.listen(configService.get<number>('porta', 3000));
}
bootstrap();
