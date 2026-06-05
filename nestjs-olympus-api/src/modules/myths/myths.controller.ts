import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { MythsService } from './myths.service';
import { Myth } from './myth.entity';
import { CreateMythDto } from './dto/create-myth.dto';
import { UpdateMythDto } from './dto/update-myth.dto';

@Controller('myths')
export class MythsController {
  constructor(private readonly mythsService: MythsService) {}

  @Get()
  async findAll(): Promise<Myth[]> {
    return this.mythsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Myth> {
    const myth = await this.mythsService.findOne(id);

    if (!myth) {
      throw new NotFoundException(`Myth with id ${id} not found`);
    }

    return myth;
  }

  @Post()
  async create(@Body() dto: CreateMythDto): Promise<Myth> {
    return this.mythsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMythDto,
  ): Promise<Myth | null> {
    const myth = await this.mythsService.findOne(id);

    if (!myth) {
      throw new NotFoundException(`Myth with id ${id} not found`);
    }

    return this.mythsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const myth = await this.mythsService.findOne(id);

    if (!myth) {
      throw new NotFoundException(`Myth with id ${id} not found`);
    }

    return this.mythsService.remove(id);
  }
}
