import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conta } from './entities/conta.entity';
import { Transacao } from './entities/transacao.entity';
import { CONTA_REPOSITORY } from './repositories/conta-repository.interface';
import { TRANSACAO_REPOSITORY } from './repositories/transacao-repository.interface';
import { UNIT_OF_WORK } from './unit-of-work/unit-of-work.interface';
import { DepositoStrategy } from './strategies/deposito.strategy';
import { TransferenciaStrategy } from './strategies/transferencia.strategy';
import { EstornoStrategy } from './strategies/estorno.strategy';
import { TransacaoStrategyFactory } from './strategies/transacao-strategy.factory';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ContaTypeOrmRepository } from '../../infrastructure/database/repositories/conta-typeorm.repository';
import { TransacaoTypeOrmRepository } from '../../infrastructure/database/repositories/transacao-typeorm.repository';
import { TypeOrmUnitOfWork } from '../../infrastructure/database/unit-of-work/typeorm-unit-of-work';

@Module({
  imports: [TypeOrmModule.forFeature([Conta, Transacao])],
  controllers: [WalletController],
  providers: [
    WalletService,
    DepositoStrategy,
    TransferenciaStrategy,
    EstornoStrategy,
    TransacaoStrategyFactory,
    {
      provide: CONTA_REPOSITORY,
      useClass: ContaTypeOrmRepository,
    },
    {
      provide: TRANSACAO_REPOSITORY,
      useClass: TransacaoTypeOrmRepository,
    },
    {
      provide: UNIT_OF_WORK,
      useClass: TypeOrmUnitOfWork,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
