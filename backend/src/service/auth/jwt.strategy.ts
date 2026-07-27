import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadJwt, UsuarioAutenticado } from '../../model/auth/interface/payload-jwt.interface';
import { ConstantUtils } from '../../shared/utils/constant.utils';

const extrairDoCookie = (req: Request): string | null => {
  return req?.cookies?.[ConstantUtils.JWT_TOKEN] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extrairDoCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.segredo') as string,
    });
  }

  validate(payload: PayloadJwt): UsuarioAutenticado {
    return { id: payload.sub, email: payload.email };
  }
}
