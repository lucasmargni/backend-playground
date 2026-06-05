import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { Myth } from '../myths/myth.entity';

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

  @ManyToMany(() => MythologicalBeing, (being) => being.children)
  @JoinTable({
    name: 'being_relationships',
    joinColumn: { name: 'child_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parent_id', referencedColumnName: 'id' },
  })
  parents!: MythologicalBeing[];

  @ManyToMany(() => MythologicalBeing, (being) => being.parents)
  children!: MythologicalBeing[];

  @ManyToMany(() => Myth, (myth) => myth.characters)
  myths!: Myth[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
