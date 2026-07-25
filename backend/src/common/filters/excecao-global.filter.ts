import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExcecaoDominio } from '../exceptions/excecao-dominio.base';

@Catch()
export class ExcecaoGlobalFilter implements ExceptionFilter {
  catch(excecao: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusHttp, corpo } = this.resolverExcecao(excecao);

    response.status(statusHttp).json({
      ...corpo,
      caminho: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolverExcecao(excecao: unknown): {
    statusHttp: number;
    corpo: Record<string, unknown>;
  } {
    if (excecao instanceof ExcecaoDominio) {
      return {
        statusHttp: excecao.statusHttp,
        corpo: { codigo: excecao.codigo, mensagem: excecao.message },
      };
    }

    if (excecao instanceof HttpException) {
      const resposta = excecao.getResponse();
      return {
        statusHttp: excecao.getStatus(),
        corpo:
          typeof resposta === 'string' ? { mensagem: resposta } : { ...resposta },
      };
    }

    return {
      statusHttp: HttpStatus.INTERNAL_SERVER_ERROR,
      corpo: { codigo: 'ERRO_INTERNO', mensagem: 'Erro interno do servidor' },
    };
  }
}
