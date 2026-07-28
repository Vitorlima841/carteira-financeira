import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ConstantUtils } from '../../../shared/utils/constant.utils';

export class CriarDepositoDto {
  @ApiProperty({ description: 'Valor do depósito', example: '150.00' })
  @IsString({ message: 'O valor deve ser enviado como texto para preservar a precisão' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Matches(ConstantUtils.PADRAO_VALOR_MONETARIO, {
    message: 'Informe um valor positivo com até 2 casas decimais',
  })
  valor: string;
}
