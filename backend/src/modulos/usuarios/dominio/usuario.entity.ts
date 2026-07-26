/**
 * Entidade de domínio Usuario. Não possui qualquer dependência do
 * TypeORM: representa apenas as regras e o estado do negócio.
 */
export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public senhaHash: string,
    public readonly criadoEm: Date,
    public atualizadoEm: Date,
  ) {}
}
