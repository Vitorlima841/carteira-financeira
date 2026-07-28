import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracao from './shared/config/configuracao';
import { configuracaoBancoDados } from './shared/config/banco-dados.config';
import { UsuariosModule } from './service/usuario/usuarios.module';
import { ContaModule } from './service/conta/conta.module';
import { TransacaoModule } from './service/transacao/transacao.module';
import { AuthModule } from './service/auth/auth.module';
import { UnidadeTrabalhoModule } from './shared/database/unidade-trabalho.module';

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
    UnidadeTrabalhoModule,
    UsuariosModule,
    ContaModule,
    TransacaoModule,
    AuthModule,
  ],
})
export class AppModule {}
