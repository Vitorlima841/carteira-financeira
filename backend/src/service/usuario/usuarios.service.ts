import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';
import { CriarUsuarioDto } from '../../model/usuario/DTO/criar-usuario.dto';
import { DadosCriarUsuario } from '../../model/usuario/interface/dados-criar-usuario.interface';
import { EmailJaCadastradoError } from '../../model/usuario/error/email-ja-cadastrado.error';
import { UsuarioNaoEncontradoError } from '../../model/usuario/error/usuario-nao-encontrado.error';
import {Usuario} from "../../model/usuario/usuario.entity";
import { UsuarioRepositorioTypeOrm } from '../../repository/usuario.repository';
import { ContaService } from '../conta/conta.service';
import { UnidadeTrabalhoService } from '../../shared/database/unidade-trabalho.service';
import { ConstantUtils } from '../../shared/utils/constant.utils';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorioTypeOrm,
    private readonly contaService: ContaService,
    private readonly unidadeTrabalho: UnidadeTrabalhoService,
  ) {}

  async buscarUsuarioLogado(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw new UsuarioNaoEncontradoError();
    }
    return usuario;
  }

  async cadastrar(criarUsuarioDto: CriarUsuarioDto): Promise<Usuario> {
    const senhaHash = await bcrypt.hash(criarUsuarioDto.senha, ConstantUtils.ROUNDS_SALT_SENHA);

    return this.criarComConta({
      nome: criarUsuarioDto.nome,
      email: criarUsuarioDto.email,
      senhaHash,
    });
  }

  async criarComConta(dados: DadosCriarUsuario): Promise<Usuario> {
    return this.unidadeTrabalho.executar(async (manager) => {
      const usuario = await this.criarUsuario(dados, manager);
      await this.contaService.criarParaUsuario(usuario.id, manager);
      return usuario;
    });
  }

  async criarUsuario(dados: DadosCriarUsuario, manager?: EntityManager): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepositorio.buscarPorEmail(dados.email, manager);
    if (usuarioExistente) {
      throw new EmailJaCadastradoError(dados.email);
    }

    const agora = new Date();
    const usuario =  new Usuario();

    usuario.id = randomUUID();
    usuario.nome = dados.nome;
    usuario.email = dados.email;
    usuario.senhaHash = dados.senhaHash;
    usuario.criadoEm = agora;
    usuario.atualizadoEm = agora;

    await this.usuarioRepositorio.salvar(usuario, manager);
    return usuario;
  }
}
