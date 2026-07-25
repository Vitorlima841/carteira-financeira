import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RespostaPadrao<T> {
  dados: T;
  timestamp: string;
}

@Injectable()
export class TransformarRespostaInterceptor<T>
  implements NestInterceptor<T, RespostaPadrao<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RespostaPadrao<T>> {
    return next.handle().pipe(
      map((dados) => ({
        dados,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
