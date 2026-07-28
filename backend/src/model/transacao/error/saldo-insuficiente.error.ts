import { ErroDominio } from '../../../shared/errors/erro-dominio';

export class SaldoInsuficienteError extends ErroDominio {
  readonly codigo = 'SALDO_INSUFICIENTE';

  constructor(saldoDisponivel: string, valorSolicitado: string) {
    super(`Saldo insuficiente: disponível ${saldoDisponivel}, solicitado ${valorSolicitado}`);
  }
}
