import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GodDomain {
  SKY = 'sky',
  SEA = 'sea',
  UNDERWORLD = 'underworld',
  WAR = 'war',
  WISDOM = 'wisdom',
  LOVE = 'love',
  FIRE = 'fire',
  HUNT = 'hunt',
  HARVEST = 'harvest',
  SUN = 'sun',
  MOON = 'moon',
  MESSENGER = 'messenger',
}

@Entity('gods')
export class God {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'enum', enum: GodDomain })
  domain!: GodDomain;

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
