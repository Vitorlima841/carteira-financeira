import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CredenciaisInvalidasException } from '../../common/exceptions/credenciais-invalidas.exception';
import { EmailJaCadastradoException } from '../../common/exceptions/email-ja-cadastrado.exception';
import { Usuario } from '../users/entities/usuario.entity';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../users/repositories/usuario-repository.interface';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';
import { RespostaAutenticacaoDto } from './dto/resposta-autenticacao.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(registrarDto: RegistrarDto): Promise<RespostaAutenticacaoDto> {
    const { nome, email, senha } = registrarDto;

    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new EmailJaCadastradoException(email);
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const usuario = await this.usuarioRepository.criar({ nome, email, senhaHash });

    return this.montarResposta(usuario);
  }

  async login(loginDto: LoginDto): Promise<RespostaAutenticacaoDto> {
    const usuario = await this.validarUsuario(loginDto.email, loginDto.senha);
    return this.montarResposta(usuario);
  }

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new CredenciaisInvalidasException();
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidasException();
    }

    return usuario;
  }

  private montarResposta(usuario: Usuario): RespostaAutenticacaoDto {
    return {
      tokenAcesso: this.gerarToken(usuario.id, usuario.email),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  private gerarToken(usuarioId: string, email: string): string {
    return this.jwtService.sign({ sub: usuarioId, email });
  }
}
