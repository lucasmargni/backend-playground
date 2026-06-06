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
  Query,
} from '@nestjs/common';
import { MythsService } from './myths.service';
import { Myth } from './myth.entity';
import { CreateMythDto } from './dto/create-myth.dto';
import { UpdateMythDto } from './dto/update-myth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginateDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('myths')
@ApiTags('Myths')
export class MythsController {
  constructor(private readonly mythsService: MythsService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'finds all myths in the database' })
  @ApiResponse({ status: 200, description: 'Myths found' })
  @Get()
  async findAll(
    @Query() pagination: PaginateDto,
  ): Promise<PaginatedResponse<Myth>> {
    return this.mythsService.findAll(pagination);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'finds a myth by id' })
  @ApiResponse({ status: 200, description: 'Myth found' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Myth> {
    const myth = await this.mythsService.findOne(id);

    if (!myth) {
      throw new NotFoundException(`Myth with id ${id} not found`);
    }

    return myth;
  }

  @ApiOperation({ summary: 'creates a new myth' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 201, description: 'Myth created' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
  @Post()
  async create(@Body() dto: CreateMythDto): Promise<Myth> {
    return this.mythsService.create(dto);
  }

  @ApiOperation({ summary: 'adds a character to a myth by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 201, description: 'Character added to myth' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
  @Post(':id/characters/:charId')
  async addCharacter(
    @Param('id') id: string,
    @Param('charId') charId: string,
  ): Promise<Myth> {
    return this.mythsService.addCharacter(id, charId);
  }

  @ApiOperation({ summary: 'updates fields of a myth by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 200, description: 'Myth updated' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
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

  @ApiOperation({ summary: 'removes a myth by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 200, description: 'Myth deleted' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const myth = await this.mythsService.findOne(id);

    if (!myth) {
      throw new NotFoundException(`Myth with id ${id} not found`);
    }

    return this.mythsService.remove(id);
  }

  @ApiOperation({ summary: 'removes a character to a myth by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 200, description: 'Character removed from myth' })
  @ApiResponse({ status: 404, description: 'Myth not found' })
  @Delete(':id/characters/:charId')
  async removeCharacter(
    @Param('id') id: string,
    @Param('charId') charId: string,
  ): Promise<Myth> {
    return this.mythsService.removeCharacter(id, charId);
  }
}
