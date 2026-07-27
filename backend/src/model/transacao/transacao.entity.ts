import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Conta } from '../conta/conta.entity';
import { StatusTransacao } from './enum/status-transacao.enum';
import { TipoTransacao } from './enum/tipo-transacao.enum';

@Entity('transacoes')
@Index('IDX_transacoes_conta_origem_id', ['contaOrigemId'])
@Index('IDX_transacoes_conta_destino_id', ['contaDestinoId'])
export class Transacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoTransacao, enumName: 'tipo_transacao_enum' })
  tipo: TipoTransacao;

  @Column({ type: 'enum', enum: StatusTransacao, enumName: 'status_transacao_enum', default: StatusTransacao.PENDENTE })
  status: StatusTransacao;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  valor: string;

  @Column({ type: 'uuid', name: 'conta_origem_id', nullable: true })
  contaOrigemId: string | null;

  @Column({ type: 'uuid', name: 'conta_destino_id', nullable: true })
  contaDestinoId: string | null;

  @Column({ type: 'uuid', name: 'transacao_estornada_id', nullable: true, unique: true })
  transacaoEstornadaId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadados: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @ManyToOne(() => Conta, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conta_origem_id' })
  contaOrigem: Conta | null;

  @ManyToOne(() => Conta, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conta_destino_id' })
  contaDestino: Conta | null;

  @ManyToOne(() => Transacao, (transacao) => transacao.estornos, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transacao_estornada_id' })
  transacaoEstornada: Transacao | null;

  @OneToMany(() => Transacao, (transacao) => transacao.transacaoEstornada)
  estornos: Transacao[];
}
