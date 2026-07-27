import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarUsuarioDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  nome: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'usuario@exemplo.com' })
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha-secreta' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
