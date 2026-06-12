import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction } from './audit-action.enum';
import { AuditResourceType } from './audit-resource-type.enum';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'enum', enum: AuditResourceType })
  resourceType!: AuditResourceType;

  @Column({ type: 'uuid' })
  resourceId!: string;

  @Column({ type: 'boolean' })
  success!: boolean;

  @Column({ type: 'varchar', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
