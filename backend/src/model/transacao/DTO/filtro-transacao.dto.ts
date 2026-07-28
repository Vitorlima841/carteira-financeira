import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ConstantUtils } from '../../../shared/utils/constant.utils';
import { StatusTransacao } from '../enum/status-transacao.enum';
import { TipoTransacao } from '../enum/tipo-transacao.enum';

export class FiltroTransacaoDto {
  @ApiPropertyOptional({ description: 'Página do extrato', default: ConstantUtils.PAGINA_PADRAO })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior ou igual a 1' })
  pagina: number = ConstantUtils.PAGINA_PADRAO;

  @ApiPropertyOptional({
    description: 'Quantidade de registros por página',
    default: ConstantUtils.LIMITE_PADRAO,
    maximum: ConstantUtils.LIMITE_MAXIMO,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior ou igual a 1' })
  @Max(ConstantUtils.LIMITE_MAXIMO, {
    message: `O limite deve ser menor ou igual a ${ConstantUtils.LIMITE_MAXIMO}`,
  })
  limite: number = ConstantUtils.LIMITE_PADRAO;

  @ApiPropertyOptional({ description: 'Filtra pelo tipo da transação', enum: TipoTransacao })
  @IsOptional()
  @IsEnum(TipoTransacao, { message: 'Informe um tipo de transação válido' })
  tipo?: TipoTransacao;

  @ApiPropertyOptional({ description: 'Filtra pelo status da transação', enum: StatusTransacao })
  @IsOptional()
  @IsEnum(StatusTransacao, { message: 'Informe um status de transação válido' })
  status?: StatusTransacao;
}
