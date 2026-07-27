import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../model/usuario/usuario.entity';
import { UsuarioRepositorioTypeOrm } from '../../repository/usuario.repository';
import { ContaModule } from '../conta/conta.module';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from '../../controller/usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), ContaModule],
  controllers: [UsuariosController],
  providers: [UsuarioRepositorioTypeOrm, UsuariosService],
  exports: [UsuarioRepositorioTypeOrm, UsuariosService, TypeOrmModule],
})
export class UsuariosModule {}
