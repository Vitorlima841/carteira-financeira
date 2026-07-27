import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CookieOptions, Response } from 'express';
import { AuthDto } from '../../model/auth/DTO/auth.dto';
import { RespostaAutenticacaoDto } from '../../model/auth/DTO/resposta-autenticacao.dto';
import { CredenciaisInvalidasError } from '../../model/auth/error/credenciais-invalidas.error';
import { PayloadJwt } from '../../model/auth/interface/payload-jwt.interface';
import { Usuario } from '../../model/usuario/usuario.entity';
import { UsuarioRepositorioTypeOrm } from '../../repository/usuario.repository';
import { ConstantUtils } from '../../shared/utils/constant.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorioTypeOrm,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async autenticar(authDto: AuthDto, resposta: Response): Promise<RespostaAutenticacaoDto> {
    const usuario = await this.validarUsuario(authDto.email, authDto.senha);

    const payload: PayloadJwt = { sub: usuario.id, email: usuario.email };
    const tokenAcesso = this.jwtService.sign(payload);
    const expiraEm = this.obterExpiracao(tokenAcesso);

    resposta.cookie(ConstantUtils.JWT_TOKEN, tokenAcesso, {
      ...this.opcoesCookie(),
      expires: expiraEm,
    });

    return RespostaAutenticacaoDto.apartirDoDominio(usuario, tokenAcesso, expiraEm);
  }

  desconectar(resposta: Response): void {
    resposta.clearCookie(ConstantUtils.JWT_TOKEN, this.opcoesCookie());
  }

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    const usuario = await this.usuarioRepositorio.buscarPorEmail(email);
    if (!usuario) {
      throw new CredenciaisInvalidasError();
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidasError();
    }

    return usuario;
  }

  private opcoesCookie(): CookieOptions {
    return {
      path: ConstantUtils.CAMINHO_COOKIE,
      httpOnly: true,
      secure: this.configService.get<string>('ambiente') === 'production',
      sameSite: 'lax',
    };
  }

  private obterExpiracao(token: string): Date {
    const { exp } = this.jwtService.decode(token) as { exp: number };
    return new Date(exp * 1000);
  }
}
