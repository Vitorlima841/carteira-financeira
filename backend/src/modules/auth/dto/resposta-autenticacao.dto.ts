export class RespostaAutenticacaoDto {
  tokenAcesso: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}
