import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const configuracaoBancoDados = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('banco.host'),
  port: configService.get<number>('banco.porta'),
  username: configService.get<string>('banco.usuario'),
  password: configService.get<string>('banco.senha'),
  database: configService.get<string>('banco.nome'),
  entities: [__dirname + '/../../model/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
});
