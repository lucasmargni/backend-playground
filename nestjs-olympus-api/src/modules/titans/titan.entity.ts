import { ChildEntity, Column } from 'typeorm';
import { MythologicalBeing } from '../beings/being.entity';

export enum TitanGeneration {
  PRIMORDIAL = 'primordial',
  SECOND = 'second',
}

@ChildEntity('titans')
export class Titan extends MythologicalBeing {
  @Column({ type: 'enum', enum: TitanGeneration })
  generation!: TitanGeneration;
}
