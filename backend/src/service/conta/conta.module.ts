import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaController } from '../../controller/conta.controller';
import { Conta } from '../../model/conta/conta.entity';
import { ContaRepositorioTypeOrm } from '../../repository/conta.repository';
import { ContaService } from './conta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conta])],
  controllers: [ContaController],
  providers: [ContaRepositorioTypeOrm, ContaService],
  exports: [ContaRepositorioTypeOrm, ContaService, TypeOrmModule],
})
export class ContaModule {}
