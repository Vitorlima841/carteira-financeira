import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public-auth.decorator';
import { MensagensGlobais } from '../utils/mensagens.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(contexto: ExecutionContext) {
    const ehPublico = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);

    if (ehPublico) {
      return true;
    }

    return super.canActivate(contexto);
  }

  handleRequest<TUsuario>(erro: unknown, usuario: TUsuario): TUsuario {
    if (erro || !usuario) {
      throw new UnauthorizedException(MensagensGlobais.TOKEN_INVALIDO);
    }
    return usuario;
  }
}
