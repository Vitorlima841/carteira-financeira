import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lancamento } from '../../model/lancamento/lancamento.entity';
import { Transacao } from '../../model/transacao/transacao.entity';
import { LancamentoRepositorioTypeOrm } from '../../repository/lancamento.repository';
import { TransacaoRepositorioTypeOrm } from '../../repository/transacao.repository';
import { ContaModule } from '../conta/conta.module';
import { UsuariosModule } from '../usuario/usuarios.module';
import { TransacaoService } from './transacao.service';
import { TransacaoController } from '../../controller/transacao.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transacao, Lancamento]), ContaModule, UsuariosModule],
  controllers: [TransacaoController],
  providers: [TransacaoRepositorioTypeOrm, LancamentoRepositorioTypeOrm, TransacaoService],
  exports: [TransacaoRepositorioTypeOrm, LancamentoRepositorioTypeOrm, TransacaoService],
})
export class TransacaoModule {}
