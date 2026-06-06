import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SearchDto } from './dto/search.do';
import { God } from '../gods/god.entity';
import { Titan } from '../titans/titan.entity';
import { Myth } from '../myths/myth.entity';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get()
  async findAll(@Query() dto: SearchDto): Promise<(God | Titan | Myth)[]> {
    return this.searchService.search(dto);
  }
}
