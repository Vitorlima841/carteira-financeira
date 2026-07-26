import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../dominio/usuario.entity';

/**
 * Representação pública de um usuário, sem dados sensíveis
 * (nunca expõe `senhaHash`).
 */
export class UsuarioRespostaDto {
  @ApiProperty({ description: 'Identificador único do usuário' })
  id: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  nome: string;

  @ApiProperty({ description: 'E-mail do usuário' })
  email: string;

  @ApiProperty({ description: 'Data de criação do cadastro' })
  criadoEm: Date;

  static apartirDoDominio(usuario: Usuario): UsuarioRespostaDto {
    const dto = new UsuarioRespostaDto();
    dto.id = usuario.id;
    dto.nome = usuario.nome;
    dto.email = usuario.email;
    dto.criadoEm = usuario.criadoEm;
    return dto;
  }
}
