import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from '../service/usuario/usuarios.service';
import { CriarUsuarioDto } from '../model/usuario/DTO/criar-usuario.dto';
import { UsuarioRespostaDto } from '../model/usuario/DTO/usuario-resposta.dto';
import { UsuarioAutenticado } from '../model/auth/interface/payload-jwt.interface';
import { Public } from '../shared/decorators/public-auth.decorator';
import { UsuarioLogado } from '../shared/decorators/usuario-logado.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um novo usuário e sua conta' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UsuarioRespostaDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'E-mail já cadastrado' })
  async cadastrar(@Body() criarUsuarioDto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.cadastrar(criarUsuarioDto);
    return UsuarioRespostaDto.apartirDoDominio(usuario);
  }

  @Get('/eu')
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: HttpStatus.OK, type: UsuarioRespostaDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Token inválido ou ausente' })
  async buscarUsuarioLogado(
    @UsuarioLogado() usuarioAutenticado: UsuarioAutenticado,
  ): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.buscarUsuarioLogado(usuarioAutenticado.id);
    return UsuarioRespostaDto.apartirDoDominio(usuario);
  }
}
