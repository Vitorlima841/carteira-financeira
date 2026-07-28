import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { ConstantUtils } from '../../../shared/utils/constant.utils';
import { DirecaoLancamento } from '../enum/direcao-lancamento.enum';
import { Lancamento } from '../lancamento.entity';

export class LancamentoRespostaDto {
  @ApiProperty({ description: 'Identificador único do lançamento' })
  id: string;

  @ApiProperty({ description: 'Conta afetada pelo lançamento' })
  contaId: string;

  @ApiProperty({ description: 'Direção do lançamento', enum: DirecaoLancamento })
  direcao: DirecaoLancamento;

  @ApiProperty({ description: 'Valor do lançamento', example: '150.00' })
  valor: string;

  @ApiProperty({ description: 'Data de criação do lançamento' })
  criadoEm: Date;

  static apartirDoDominio(lancamento: Lancamento): LancamentoRespostaDto {
    const dto = new LancamentoRespostaDto();
    dto.id = lancamento.id;
    dto.contaId = lancamento.contaId;
    dto.direcao = lancamento.direcao;
    dto.valor = new Decimal(lancamento.valor).toFixed(ConstantUtils.ESCALA_MONETARIA);
    dto.criadoEm = lancamento.criadoEm;
    return dto;
  }
}
