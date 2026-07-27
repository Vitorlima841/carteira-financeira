import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Conta } from '../conta/conta.entity';
import { Transacao } from '../transacao/transacao.entity';
import { DirecaoLancamento } from './enum/direcao-lancamento.enum';

@Entity('lancamentos')
@Index('IDX_lancamentos_conta_id', ['contaId'])
@Index('IDX_lancamentos_transacao_id', ['transacaoId'])
export class Lancamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'transacao_id' })
  transacaoId: string;

  @Column({ type: 'uuid', name: 'conta_id' })
  contaId: string;

  @Column({ type: 'enum', enum: DirecaoLancamento, enumName: 'direcao_lancamento_enum' })
  direcao: DirecaoLancamento;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  valor: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @ManyToOne(() => Transacao, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transacao_id' })
  transacao: Transacao;

  @ManyToOne(() => Conta, (conta) => conta.lancamentos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conta_id' })
  conta: Conta;
}
