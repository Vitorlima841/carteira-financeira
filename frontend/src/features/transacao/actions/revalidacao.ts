import { revalidatePath } from 'next/cache';
import { ROTAS } from '@/constants/rotas';

export function revalidarExtrato(): void {
  revalidatePath(ROTAS.transacoes);
}
