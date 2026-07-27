import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../shared/decorators/usuario-atual.decorator';
import { UsuariosService } from '../service/usuarios.service';
import { UsuarioRespostaDto } from '../model/usuario/DTO/usuario-resposta.dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('eu')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  async buscarUsuarioLogado(
    @UsuarioAtual() usuarioAutenticado: UsuarioAutenticado,
  ): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.buscarUsuarioLogado(usuarioAutenticado.id);
    return UsuarioRespostaDto.apartirDoDominio(usuario);
  }
}
