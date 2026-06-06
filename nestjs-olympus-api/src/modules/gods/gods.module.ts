import { Module } from '@nestjs/common';
import { GodsController } from './gods.controller';
import { GodsService } from './gods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { God } from './god.entity';
import { MythologicalBeing } from '../beings/being.entity';

@Module({
  imports: [TypeOrmModule.forFeature([God, MythologicalBeing])],
  controllers: [GodsController],
  providers: [GodsService],
})
export class GodsModule {}
