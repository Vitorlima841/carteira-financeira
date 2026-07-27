import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conta } from '../../model/conta/conta.entity';
import { Usuario } from '../../model/usuario/usuario.entity';
import { ContaRepositorioTypeOrm } from '../../repository/conta.repository';
import { UsuarioRepositorioTypeOrm } from '../../repository/usuario.repository';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from '../../controller/usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Conta])],
  controllers: [UsuariosController],
  providers: [UsuarioRepositorioTypeOrm, ContaRepositorioTypeOrm, UsuariosService],
  exports: [UsuarioRepositorioTypeOrm, ContaRepositorioTypeOrm, UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
