import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuario/usuario.entity';
import { UsuarioRespostaDto } from '../../usuario/DTO/usuario-resposta.dto';

export class RespostaAutenticacaoDto {
  @ApiProperty({ description: 'Token JWT de acesso. Também é enviado no cookie httpOnly' })
  tokenAcesso: string;

  @ApiProperty({ description: 'Data e hora em que o token expira' })
  expiraEm: Date;

  @ApiProperty({ description: 'Dados do usuário autenticado', type: UsuarioRespostaDto })
  usuario: UsuarioRespostaDto;

  static apartirDoDominio(
    usuario: Usuario,
    tokenAcesso: string,
    expiraEm: Date,
  ): RespostaAutenticacaoDto {
    const dto = new RespostaAutenticacaoDto();
    dto.tokenAcesso = tokenAcesso;
    dto.expiraEm = expiraEm;
    dto.usuario = UsuarioRespostaDto.apartirDoDominio(usuario);
    return dto;
  }
}
