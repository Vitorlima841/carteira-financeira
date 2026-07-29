import type { EstadoFormulario } from '@/types/formulario';
import type { Transacao } from '@/types/transacao';

export type { CriarDepositoPayload, CriarTransferenciaPayload, Transacao } from '@/types/transacao';

export type CampoDeposito = 'valor';

export type CampoTransferencia = 'emailDestinatario' | 'valor';

export interface EstadoFormularioTransacao<TCampo extends string> extends EstadoFormulario<TCampo> {
  transacao?: Transacao;
}

export type EstadoFormularioDeposito = EstadoFormularioTransacao<CampoDeposito>;

export type EstadoFormularioTransferencia = EstadoFormularioTransacao<CampoTransferencia>;

export type EstadoEstorno = EstadoFormularioTransacao<never>;
