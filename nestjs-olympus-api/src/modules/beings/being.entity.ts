import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

@Entity('beings')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class MythologicalBeing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  symbol!: string | null;

  @Column({ type: 'varchar', nullable: true })
  romanName!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
