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
import { GodsService } from './gods.service';
import { God } from './god.entity';
import { CreateGodDto } from './dto/create-god.dto';
import { UpdateGodDto } from './dto/update-god.dto';

@Controller('gods')
export class GodsController {
  constructor(private readonly godsService: GodsService) {}

  @Get()
  async findAll(): Promise<God[]> {
    return this.godsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<God> {
    const god = await this.godsService.findOne(id);

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    return god;
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
