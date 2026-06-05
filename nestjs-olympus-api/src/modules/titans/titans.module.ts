import { Module } from '@nestjs/common';
import { TitansController } from './titans.controller';
import { TitansService } from './titans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Titan } from './titan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Titan])],
  controllers: [TitansController],
  providers: [TitansService],
})
export class TitansModule {}
