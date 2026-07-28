import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { LancamentoRespostaDto } from '../../lancamento/DTO/lancamento-resposta.dto';
import { Lancamento } from '../../lancamento/lancamento.entity';
import { ConstantUtils } from '../../../shared/utils/constant.utils';
import { StatusTransacao } from '../enum/status-transacao.enum';
import { TipoTransacao } from '../enum/tipo-transacao.enum';
import { Transacao } from '../transacao.entity';

export class TransacaoRespostaDto {
  @ApiProperty({ description: 'Identificador único da transação' })
  id: string;

  @ApiProperty({ description: 'Tipo da transação', enum: TipoTransacao })
  tipo: TipoTransacao;

  @ApiProperty({ description: 'Status da transação', enum: StatusTransacao })
  status: StatusTransacao;

  @ApiProperty({ description: 'Valor da transação', example: '150.00' })
  valor: string;

  @ApiProperty({ description: 'Conta de origem (nula em depósitos)', nullable: true })
  contaOrigemId: string | null;

  @ApiProperty({ description: 'Conta de destino (nula em estornos de depósito)', nullable: true })
  contaDestinoId: string | null;

  @ApiProperty({ description: 'Transação estornada por esta (apenas em estornos)', nullable: true })
  transacaoEstornadaId: string | null;

  @ApiProperty({ description: 'Data de criação da transação' })
  criadoEm: Date;

  @ApiPropertyOptional({ description: 'Lançamentos do livro-razão', type: [LancamentoRespostaDto] })
  lancamentos?: LancamentoRespostaDto[];

  static apartirDoDominio(transacao: Transacao, lancamentos?: Lancamento[]): TransacaoRespostaDto {
    const dto = new TransacaoRespostaDto();
    dto.id = transacao.id;
    dto.tipo = transacao.tipo;
    dto.status = transacao.status;
    dto.valor = new Decimal(transacao.valor).toFixed(ConstantUtils.ESCALA_MONETARIA);
    dto.contaOrigemId = transacao.contaOrigemId;
    dto.contaDestinoId = transacao.contaDestinoId;
    dto.transacaoEstornadaId = transacao.transacaoEstornadaId;
    dto.criadoEm = transacao.criadoEm;
    if (lancamentos) {
      dto.lancamentos = lancamentos.map((lancamento) => LancamentoRespostaDto.apartirDoDominio(lancamento));
    }
    return dto;
  }
}
