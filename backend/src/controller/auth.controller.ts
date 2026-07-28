import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthDto } from '../model/auth/DTO/auth.dto';
import { RespostaAutenticacaoDto } from '../model/auth/DTO/resposta-autenticacao.dto';
import { AuthService } from '../service/auth/auth.service';
import { Public } from '../shared/decorators/public-auth.decorator';
import { MensagensGlobais } from '../shared/utils/mensagens.util';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica o usuário e gera o token de acesso' })
  @ApiResponse({ status: HttpStatus.OK, type: RespostaAutenticacaoDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas' })
  async login(@Body() authDto: AuthDto, @Res({ passthrough: true }) resposta: Response): Promise<RespostaAutenticacaoDto> {
    return this.authService.autenticar(authDto, resposta);
  }

  @ApiBearerAuth()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerra a sessão do usuário e remove o cookie de acesso' })
  @ApiResponse({ status: HttpStatus.OK, description: MensagensGlobais.DESCONECTADO_COM_SUCESSO })
  logout(@Res({ passthrough: true }) resposta: Response): { mensagem: string } {
    this.authService.desconectar(resposta);
    return { mensagem: MensagensGlobais.DESCONECTADO_COM_SUCESSO };
  }
}
