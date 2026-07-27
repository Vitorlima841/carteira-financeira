import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ConstantUtils } from '../../../shared/utils/constant.utils';
import { Conta } from '../conta.entity';

export class ContaRespostaDto {
  @ApiProperty({ description: 'Identificador único da conta' })
  id: string;

  @ApiProperty({ description: 'Saldo atual da conta', example: '0.00' })
  saldo: string;

  @ApiProperty({ description: 'Moeda da conta', example: 'BRL' })
  moeda: string;

  static apartirDoDominio(conta: Conta): ContaRespostaDto {
    const dto = new ContaRespostaDto();
    dto.id = conta.id;
    dto.saldo = new Decimal(conta.saldoCache).toFixed(ConstantUtils.ESCALA_MONETARIA);
    dto.moeda = conta.moeda;
    return dto;
  }
}
