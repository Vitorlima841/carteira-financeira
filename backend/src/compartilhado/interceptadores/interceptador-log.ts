import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class InterceptadorLog implements NestInterceptor {
  private readonly logger = new Logger('Requisicao');

  intercept(contexto: ExecutionContext, proximo: CallHandler): Observable<unknown> {
    const requisicao = contexto.switchToHttp().getRequest();
    const { method, originalUrl } = requisicao;
    const inicio = Date.now();

    return proximo.handle().pipe(
      tap(() => {
        const duracaoMs = Date.now() - inicio;
        this.logger.log(`${method} ${originalUrl} - ${duracaoMs}ms`);
      }),
    );
  }
}
