import {Body, Controller, Post, Res} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from '../service/usuario/usuarios.service';
import {Public} from "../shared/decorators/public-auth.decorator";

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Public()
  @Post()
  async login(): Promise<any> {
    console.log('teste')
  }
}
