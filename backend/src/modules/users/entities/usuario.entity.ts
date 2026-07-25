import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome' })
  nome: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
