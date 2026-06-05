import { ChildEntity, Column } from 'typeorm';
import { MythologicalBeing } from '../beings/being.entity';

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

@ChildEntity('gods')
export class God extends MythologicalBeing {
  @Column({ type: 'enum', enum: GodDomain })
  domain!: GodDomain;
}
