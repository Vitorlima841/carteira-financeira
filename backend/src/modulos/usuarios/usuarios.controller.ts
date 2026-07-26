import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../autenticacao/infraestrutura/guards/jwt-auth.guard';
import {
  UsuarioAtual,
  UsuarioAutenticado,
} from '../../compartilhado/decoradores/usuario-atual.decorator';
import { BuscarUsuarioLogadoCasoDeUso } from './aplicacao/casos-de-uso/buscar-usuario-logado.caso-de-uso';
import { UsuarioRespostaDto } from './aplicacao/dtos/usuario-resposta.dto';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly buscarUsuarioLogadoCasoDeUso: BuscarUsuarioLogadoCasoDeUso) {}

  @Get('eu')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  async buscarUsuarioLogado(
    @UsuarioAtual() usuarioAutenticado: UsuarioAutenticado,
  ): Promise<UsuarioRespostaDto> {
    const usuario = await this.buscarUsuarioLogadoCasoDeUso.executar(usuarioAutenticado.id);
    return UsuarioRespostaDto.apartirDoDominio(usuario);
  }
}
