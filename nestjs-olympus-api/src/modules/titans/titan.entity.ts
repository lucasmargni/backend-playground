import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TitanGeneration {
  PRIMORDIAL = 'primordial',
  SECOND = 'second',
}

@Entity('titans')
export class Titan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'enum', enum: TitanGeneration })
  generation!: TitanGeneration;

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
