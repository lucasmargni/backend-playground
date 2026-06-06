import { Module } from '@nestjs/common';
import { MythsController } from './myths.controller';
import { MythsService } from './myths.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Myth } from './myth.entity';
import { MythologicalBeing } from '../beings/being.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Myth, MythologicalBeing])],
  controllers: [MythsController],
  providers: [MythsService],
})
export class MythsModule {}
