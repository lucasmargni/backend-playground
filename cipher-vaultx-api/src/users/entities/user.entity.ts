import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VaultMember } from '../../vault-members/entities/vault-member.entity';
import { VaultInvitation } from '../../vault-members/entities/vault-invitation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column({ select: false })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => VaultMember, (member) => member.user)
  vaultMembers!: VaultMember[];

  @OneToMany(() => VaultInvitation, (inv) => inv.invitedUser)
  invitations!: VaultInvitation[];
}
