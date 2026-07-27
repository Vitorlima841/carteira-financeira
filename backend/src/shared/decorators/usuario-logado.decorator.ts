import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UsuarioAutenticado } from '../../model/auth/interface/payload-jwt.interface';

export const UsuarioLogado = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const requisicao = contexto.switchToHttp().getRequest<Request>();
    return requisicao.user as UsuarioAutenticado;
  },
);
