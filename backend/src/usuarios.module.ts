import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './model/usuario/usuario.entity';
import { UsuarioRepositorioTypeOrm } from './repository/usuario.repository';
import { USUARIO_REPOSITORIO } from './model/usuario/usuario.repositorio.interface';
import { UsuariosService } from './service/usuarios.service';
import { UsuariosController } from './controller/usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [
    { provide: USUARIO_REPOSITORIO, useClass: UsuarioRepositorioTypeOrm },
    UsuariosService,
  ],
  exports: [USUARIO_REPOSITORIO, UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
