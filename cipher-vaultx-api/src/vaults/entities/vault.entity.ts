import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Secret } from '../../secrets/entities/secret.entity';

@Entity()
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

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

  @ManyToOne(() => User, (user) => user.vaults)
  user!: User;

  @OneToMany(() => Secret, (secret) => secret.vault)
  secrets!: Secret[];
}
