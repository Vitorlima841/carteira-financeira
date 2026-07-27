import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from '../../service/auth/auth.service';
import { AuthDto } from '../../model/auth/auth.dto';
import { ConstantUtils } from '../../shared/utils/constant.utils';
import { MensagensGlobais } from '../../shared/utils/mensagens.util';
import { Response } from 'express';
import { Public } from '../../shared/decorators/public-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  async login(@Res() res: Response, @Body() authDto: AuthDto): Promise<any> {
    const data = JSON.parse(atob(authDto.data));
    return await this.authService.autenticar(res, data.usuario, data.senha);
  }

  @Public()
  @Get('/logout')
  async logout(@Res() res: Response): Promise<void> {
    res.clearCookie(ConstantUtils.JWT_TOKEN);
    res.send(MensagensGlobais.DESCONECTADO_COM_SUCESSO);
  }
}
