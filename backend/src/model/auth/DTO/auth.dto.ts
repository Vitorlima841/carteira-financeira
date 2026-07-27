import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha-secreta' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
