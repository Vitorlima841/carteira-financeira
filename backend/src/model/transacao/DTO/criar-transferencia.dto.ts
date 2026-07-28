import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ConstantUtils } from '../../../shared/utils/constant.utils';

export class CriarTransferenciaDto {
  @ApiProperty({ description: 'E-mail do destinatário', example: 'destinatario@exemplo.com' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  emailDestinatario: string;

  @ApiProperty({ description: 'Valor da transferência', example: '150.00' })
  @IsString({ message: 'O valor deve ser enviado como texto para preservar a precisão' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Matches(ConstantUtils.PADRAO_VALOR_MONETARIO, {
    message: 'Informe um valor positivo com até 2 casas decimais',
  })
  valor: string;
}
