import { Module } from '@nestjs/common';
import { GodsController } from './gods.controller';
import { GodsService } from './gods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { God } from './god.entity';

@Module({
  imports: [TypeOrmModule.forFeature([God])],
  controllers: [GodsController],
  providers: [GodsService],
})
export class GodsModule {}
