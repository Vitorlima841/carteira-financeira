import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErroDominio } from '../dominio/erro-dominio';

/**
 * Mapa de código de erro de domínio para status HTTP correspondente.
 * Novos erros de domínio só precisam ser adicionados aqui, sem alterar
 * o restante do filtro (Open/Closed Principle).
 */
const MAPA_CODIGO_PARA_STATUS: Record<string, HttpStatus> = {
  SALDO_INSUFICIENTE: HttpStatus.UNPROCESSABLE_ENTITY,
  CONTA_NAO_ENCONTRADA: HttpStatus.NOT_FOUND,
  TRANSACAO_NAO_ENCONTRADA: HttpStatus.NOT_FOUND,
  TRANSACAO_NAO_REVERSIVEL: HttpStatus.CONFLICT,
  EMAIL_JA_CADASTRADO: HttpStatus.CONFLICT,
  CREDENCIAIS_INVALIDAS: HttpStatus.UNAUTHORIZED,
  TOKEN_INVALIDO: HttpStatus.UNAUTHORIZED,
  ACESSO_NEGADO: HttpStatus.FORBIDDEN,
  VALOR_INVALIDO: HttpStatus.BAD_REQUEST,
  TRANSFERENCIA_PARA_MESMA_CONTA: HttpStatus.BAD_REQUEST,
  USUARIO_NAO_ENCONTRADO: HttpStatus.NOT_FOUND,
};

/**
 * Filtro global de exceções: traduz erros de domínio e exceções do Nest
 * em respostas HTTP consistentes, com mensagens em português.
 */
@Catch()
export class FiltroExcecaoHttp implements ExceptionFilter {
  private readonly logger = new Logger('ExcecaoHttp');

  catch(excecao: unknown, host: ArgumentsHost): void {
    const contextoHttp = host.switchToHttp();
    const resposta = contextoHttp.getResponse<Response>();

    if (excecao instanceof ErroDominio) {
      const status = MAPA_CODIGO_PARA_STATUS[excecao.codigo] ?? HttpStatus.BAD_REQUEST;
      resposta.status(status).json({
        statusCode: status,
        codigo: excecao.codigo,
        mensagem: excecao.message,
      });
      return;
    }

    if (excecao instanceof HttpException) {
      const status = excecao.getStatus();
      const respostaExcecao = excecao.getResponse();
      const mensagem =
        typeof respostaExcecao === 'string'
          ? respostaExcecao
          : ((respostaExcecao as { message?: string | string[] }).message ?? excecao.message);

      resposta.status(status).json({
        statusCode: status,
        mensagem,
      });
      return;
    }

    this.logger.error('Erro não tratado', (excecao as Error)?.stack);
    resposta.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensagem: 'Erro interno no servidor',
    });
  }
}
