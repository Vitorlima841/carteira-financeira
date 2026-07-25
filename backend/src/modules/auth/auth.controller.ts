import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { RespostaAutenticacaoDto } from './dto/resposta-autenticacao.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registrar')
  async registrar(
    @Body() registrarDto: RegistrarDto,
  ): Promise<RespostaAutenticacaoDto> {
    return this.authService.registrar(registrarDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<RespostaAutenticacaoDto> {
    return this.authService.login(loginDto);
  }
}
