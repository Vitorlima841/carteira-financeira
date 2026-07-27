export abstract class ErroDominio extends Error {
  abstract readonly codigo: string;

  protected constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}
