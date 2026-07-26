import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracao from './config/configuracao';
import { configuracaoBancoDados } from './config/banco-dados.config';
import { CompartilhadoModule } from './compartilhado/compartilhado.module';
import { UsuariosModule } from './modulos/usuarios/usuarios.module';
import { AutenticacaoModule } from './modulos/autenticacao/autenticacao.module';
import { CarteiraModule } from './modulos/carteira/carteira.module';

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
