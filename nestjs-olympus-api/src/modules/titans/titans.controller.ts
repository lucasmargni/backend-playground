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
import { TitansService } from './titans.service';
import { Titan } from './titan.entity';
import { CreateTitanDto } from './dto/create-titan.dto';
import { UpdateTitanDto } from './dto/update-titan.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('titans')
export class TitansController {
  constructor(private readonly titansService: TitansService) {}

  @Public()
  @Get()
  async findAll(): Promise<Titan[]> {
    return this.titansService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Titan> {
    const titan = await this.titansService.findOne(id);

    if (!titan) {
      throw new NotFoundException(`Titan with id ${id} not found`);
    }

    return titan;
  }

  @Post()
  async create(@Body() dto: CreateTitanDto): Promise<Titan> {
    return this.titansService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTitanDto,
  ): Promise<Titan | null> {
    const titan = await this.titansService.findOne(id);

    if (!titan) {
      throw new NotFoundException(`Titan with id ${id} not found`);
    }

    return this.titansService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const titan = await this.titansService.findOne(id);

    if (!titan) {
      throw new NotFoundException(`Titan with id ${id} not found`);
    }

    return this.titansService.remove(id);
  }
}
