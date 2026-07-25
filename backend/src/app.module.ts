import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracao from './config/configuracao';
import { configuracaoBancoDados } from './config/banco-dados.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';

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
    AuthModule,
    UsersModule,
    WalletModule,
  ],
})
export class AppModule {}
