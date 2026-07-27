import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Lancamento } from '../lancamento/lancamento.entity';

@Entity('contas')
@Index('IDX_contas_usuario_id', ['usuarioId'], { unique: true })
export class Conta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'saldo_cache', default: 0 })
  saldoCache: string;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  moeda: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToOne(() => Usuario, (usuario) => usuario.conta, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Lancamento, (lancamento) => lancamento.conta)
  lancamentos: Lancamento[];
}
