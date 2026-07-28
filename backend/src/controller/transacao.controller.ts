import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransacaoService } from '../service/transacao/transacao.service';
import { CriarDepositoDto } from '../model/transacao/DTO/criar-deposito.dto';
import { CriarTransferenciaDto } from '../model/transacao/DTO/criar-transferencia.dto';
import { TransacaoRespostaDto } from '../model/transacao/DTO/transacao-resposta.dto';
import { UsuarioAutenticado } from '../model/auth/interface/payload-jwt.interface';
import { UsuarioLogado } from '../shared/decorators/usuario-logado.decorator';

@ApiTags('Transações')
@ApiBearerAuth()
@Controller('transacoes')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Post('/depositos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deposita um valor na conta do usuário autenticado' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TransacaoRespostaDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Valor inválido' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Conta não encontrada' })
  async depositar(@UsuarioLogado() usuarioAutenticado: UsuarioAutenticado, @Body() criarDepositoDto: CriarDepositoDto): Promise<TransacaoRespostaDto> {
    const transacao = await this.transacaoService.depositar(usuarioAutenticado.id, criarDepositoDto);
    return TransacaoRespostaDto.apartirDoDominio(transacao);
  }

  @Post('/transferencias')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Transfere um valor da conta do usuário autenticado para outra conta' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TransacaoRespostaDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Valor inválido ou conta de destino igual à de origem' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Destinatário ou conta não encontrada' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Saldo insuficiente' })
  async transferir(@UsuarioLogado() usuarioAutenticado: UsuarioAutenticado, @Body() criarTransferenciaDto: CriarTransferenciaDto): Promise<TransacaoRespostaDto> {
    const transacao = await this.transacaoService.transferir(usuarioAutenticado.id, criarTransferenciaDto);
    return TransacaoRespostaDto.apartirDoDominio(transacao);
  }

  @Post('/:id/estornos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Estorna uma transação da qual o usuário autenticado participou' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TransacaoRespostaDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Usuário não participa da transação' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transação não encontrada' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Transação não pode ser estornada' })
  async estornar(@UsuarioLogado() usuarioAutenticado: UsuarioAutenticado, @Param('id', ParseUUIDPipe) id: string): Promise<TransacaoRespostaDto> {
    const estorno = await this.transacaoService.estornar(usuarioAutenticado.id, id);
    return TransacaoRespostaDto.apartirDoDominio(estorno);
  }
}
