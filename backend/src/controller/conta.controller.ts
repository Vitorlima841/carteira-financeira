import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContaService } from '../service/conta/conta.service';
import { ContaRespostaDto } from '../model/conta/DTO/conta-resposta.dto';
import { UsuarioAutenticado } from '../model/auth/interface/payload-jwt.interface';
import { UsuarioLogado } from '../shared/decorators/usuario-logado.decorator';

@ApiTags('Contas')
@ApiBearerAuth()
@Controller('contas')
export class ContaController {
  constructor(private readonly contaService: ContaService) {}

  @Get('/eu')
  @ApiOperation({ summary: 'Retorna a conta do usuário autenticado' })
  @ApiResponse({ status: HttpStatus.OK, type: ContaRespostaDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token inválido ou ausente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Conta não encontrada' })
  async buscarContaDoUsuarioLogado(@UsuarioLogado() usuarioAutenticado: UsuarioAutenticado): Promise<ContaRespostaDto> {
    const conta = await this.contaService.obterPorUsuarioId(usuarioAutenticado.id);
    return ContaRespostaDto.apartirDoDominio(conta);
  }
}