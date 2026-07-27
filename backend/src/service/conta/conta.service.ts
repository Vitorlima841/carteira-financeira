import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Decimal from 'decimal.js';
import { EntityManager } from 'typeorm';
import { Conta } from '../../model/conta/conta.entity';
import { ContaNaoEncontradaError } from '../../model/conta/error/conta-nao-encontrada.error';
import { DadosCriarConta } from '../../model/conta/interface/dados-criar-conta.interface';
import { ContaRepositorioTypeOrm } from '../../repository/conta.repository';
import { ConstantUtils } from '../../shared/utils/constant.utils';

@Injectable()
export class ContaService {
  constructor(private readonly contaRepositorio: ContaRepositorioTypeOrm) {}

  async obterPorUsuarioId(usuarioId: string, manager?: EntityManager): Promise<Conta> {
    const conta = await this.contaRepositorio.buscarPorUsuarioId(usuarioId, manager);
    if (!conta) {
      throw new ContaNaoEncontradaError();
    }
    return conta;
  }

  async criarParaUsuario(usuarioId: string, manager?: EntityManager): Promise<Conta> {
    return this.criar({ usuarioId, moeda: ConstantUtils.MOEDA_PADRAO }, manager);
  }

  private async criar(dados: DadosCriarConta, manager?: EntityManager): Promise<Conta> {
    const agora = new Date();
    const conta = new Conta();

    conta.id = randomUUID();
    conta.usuarioId = dados.usuarioId;
    conta.saldoCache = new Decimal(0).toFixed(ConstantUtils.ESCALA_MONETARIA);
    conta.moeda = dados.moeda;
    conta.criadoEm = agora;
    conta.atualizadoEm = agora;

    await this.contaRepositorio.salvar(conta, manager);
    return conta;
  }
}
