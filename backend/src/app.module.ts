import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracao from './shared/config/configuracao';
import { configuracaoBancoDados } from './shared/config/banco-dados.config';
import { UsuariosModule } from './service/usuario/usuarios.module';

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
    UsuariosModule,
  ],
})
export class AppModule {}
