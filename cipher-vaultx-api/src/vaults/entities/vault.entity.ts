import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Secret } from '../../secrets/entities/secret.entity';
import { VaultMember } from '../../vault-members/entities/vault-member.entity';

@Entity()
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => VaultMember, (member) => member.vault)
  members!: VaultMember[];

  @OneToMany(() => Secret, (secret) => secret.vault)
  secrets!: Secret[];
}
