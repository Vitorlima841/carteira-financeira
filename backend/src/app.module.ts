import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracao from './shared/config/configuracao';
import { configuracaoBancoDados } from './shared/config/banco-dados.config';
import { CompartilhadoModule } from './compartilhado.module';
import { UsuariosModule } from './usuarios.module';
import { AutenticacaoModule } from './autenticacao.module';
import { CarteiraModule } from './carteira.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuracao],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: configuracaoBancoDados,
    }),
    CompartilhadoModule,
    UsuariosModule,
    AutenticacaoModule,
    CarteiraModule,
  ],
})
export class AppModule {}
