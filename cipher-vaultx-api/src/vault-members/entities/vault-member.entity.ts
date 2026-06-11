import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vault } from '../../vaults/entities/vault.entity';
import { VaultRole } from './vault-role.enum';

@Entity()
export class VaultMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: VaultRole })
  role!: VaultRole;

  @Column({ type: 'bytea' })
  encryptedKey!: Buffer;

  @Column({ type: 'bytea' })
  keyIv!: Buffer;

  @Column({ type: 'bytea' })
  keyAuthTag!: Buffer;

  @Column({ type: 'bytea' })
  salt!: Buffer;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.vaultMembers)
  user!: User;

  @ManyToOne(() => Vault, (vault) => vault.members)
  vault!: Vault;
}
