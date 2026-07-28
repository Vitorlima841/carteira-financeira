import { revalidatePath } from 'next/cache';
import { ROTAS, ROTA_LAYOUT_PAINEL } from '@/constants/rotas';

export function revalidarSaldo(): void {
  revalidatePath(ROTAS.conta);
  revalidatePath(ROTA_LAYOUT_PAINEL, 'layout');
}
