import { ApiProperty } from '@nestjs/swagger';
import { Transacao } from '../transacao.entity';
import { TransacaoRespostaDto } from './transacao-resposta.dto';

export class ExtratoPaginadoDto {
  @ApiProperty({ description: 'Transações da página', type: [TransacaoRespostaDto] })
  dados: TransacaoRespostaDto[];

  @ApiProperty({ description: 'Página atual', example: 1 })
  pagina: number;

  @ApiProperty({ description: 'Registros por página', example: 20 })
  limite: number;

  @ApiProperty({ description: 'Total de transações encontradas', example: 42 })
  total: number;

  @ApiProperty({ description: 'Total de páginas disponíveis', example: 3 })
  totalPaginas: number;

  static apartirDoDominio(transacoes: Transacao[], total: number, pagina: number, limite: number): ExtratoPaginadoDto {
    const dto = new ExtratoPaginadoDto();
    dto.dados = transacoes.map((transacao) => TransacaoRespostaDto.apartirDoDominio(transacao));
    dto.pagina = pagina;
    dto.limite = limite;
    dto.total = total;
    dto.totalPaginas = Math.ceil(total / limite);
    return dto;
  }
}
