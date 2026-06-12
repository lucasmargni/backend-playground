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
export class VaultInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: VaultRole })
  role!: VaultRole;

  @Column({ type: 'bytea' })
  encryptedVaultKey!: Buffer;

  @Column({ type: 'bytea' })
  iv!: Buffer;

  @Column({ type: 'bytea' })
  authTag!: Buffer;

  @Column({ unique: true })
  token!: string;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.invitations)
  invitedUser!: User;

  @ManyToOne(() => Vault, (vault) => vault.invitations)
  vault!: Vault;
}
