import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MythologicalBeing } from '../beings/being.entity';

@Entity('myths')
export class Myth {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  title!: string;

  @Column({ type: 'text' })
  summary!: string;

  @ManyToMany(() => MythologicalBeing, (being) => being.myths)
  @JoinTable({
    name: 'appearances',
    joinColumn: { name: 'myth_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'being_id', referencedColumnName: 'id' },
  })
  characters!: MythologicalBeing[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
