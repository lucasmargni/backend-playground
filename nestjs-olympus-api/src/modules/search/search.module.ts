import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { God } from '../gods/god.entity';
import { Titan } from '../titans/titan.entity';
import { Myth } from '../myths/myth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([God, Titan, Myth])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
