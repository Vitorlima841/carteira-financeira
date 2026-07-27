import { Global, Module } from '@nestjs/common';
import { UnidadeTrabalhoService } from './unidade-trabalho.service';

@Global()
@Module({
  providers: [UnidadeTrabalhoService],
  exports: [UnidadeTrabalhoService],
})
export class UnidadeTrabalhoModule {}
