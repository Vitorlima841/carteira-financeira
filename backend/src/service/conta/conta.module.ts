import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conta } from '../../model/conta/conta.entity';
import { ContaRepositorioTypeOrm } from '../../repository/conta.repository';
import { ContaService } from './conta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conta])],
  controllers: [],
  providers: [ContaRepositorioTypeOrm, ContaService],
  exports: [ContaRepositorioTypeOrm, ContaService, TypeOrmModule],
})
export class ContaModule {}
