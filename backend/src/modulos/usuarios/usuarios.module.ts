import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioOrmEntity } from './infraestrutura/typeorm/usuario.orm-entity';
import { UsuarioRepositorioTypeOrm } from './infraestrutura/typeorm/usuario.repository';
import { USUARIO_REPOSITORIO } from './dominio/repositorios/usuario.repositorio.interface';
import { CriarUsuarioCasoDeUso } from './aplicacao/casos-de-uso/criar-usuario.caso-de-uso';
import { BuscarUsuarioLogadoCasoDeUso } from './aplicacao/casos-de-uso/buscar-usuario-logado.caso-de-uso';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioOrmEntity])],
  controllers: [UsuariosController],
  providers: [
    { provide: USUARIO_REPOSITORIO, useClass: UsuarioRepositorioTypeOrm },
    CriarUsuarioCasoDeUso,
    BuscarUsuarioLogadoCasoDeUso,
  ],
  exports: [USUARIO_REPOSITORIO, CriarUsuarioCasoDeUso, TypeOrmModule],
})
export class UsuariosModule {}
