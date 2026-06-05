import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { GodsService } from './gods.service';
import { God } from './god.entity';
import { CreateGodDto } from './dto/create-god.dto';
import { UpdateGodDto } from './dto/update-god.dto';
import { MythologicalBeing } from '../beings/being.entity';
import { Myth } from '../myths/myth.entity';
import { Public } from '../../common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('gods')
export class GodsController {
  constructor(private readonly godsService: GodsService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get()
  async findAll(): Promise<God[]> {
    return this.godsService.findAll();
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<God> {
    const god = await this.godsService.findOne(id);

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return god;
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get(':id/parents')
  async findParents(@Param('id') id: string): Promise<MythologicalBeing[]> {
    const parents = await this.godsService.findParents(id);

    if (parents == null) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return parents;
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get(':id/children')
  async findChildren(@Param('id') id: string): Promise<MythologicalBeing[]> {
    const children = await this.godsService.findChildren(id);

    if (children == null) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return children;
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get(':id/myths')
  async findMyths(@Param('id') id: string): Promise<Myth[]> {
    const myths = await this.godsService.findMyths(id);

    if (myths == null) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return myths;
  }

  @Post()
  async create(@Body() dto: CreateGodDto): Promise<God> {
    return this.godsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGodDto,
  ): Promise<God | null> {
    const god = await this.godsService.findOne(id);

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return this.godsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const god = await this.godsService.findOne(id);

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return this.godsService.remove(id);
  }
}
