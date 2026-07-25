import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegistrarDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  senha: string;
}
