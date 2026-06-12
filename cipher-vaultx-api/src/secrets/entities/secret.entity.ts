import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vault } from '../../vaults/entities/vault.entity';

@Entity()
export class Secret {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ type: 'bytea' })
  encryptedValue!: Buffer;

  @Column({ type: 'bytea' })
  iv!: Buffer;

  @Column({ type: 'bytea' })
  authTag!: Buffer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Vault, (vault) => vault.secrets)
  vault!: Vault;
}
