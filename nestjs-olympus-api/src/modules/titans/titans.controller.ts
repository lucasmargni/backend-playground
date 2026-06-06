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
import { TitansService } from './titans.service';
import { Titan } from './titan.entity';
import { CreateTitanDto } from './dto/create-titan.dto';
import { UpdateTitanDto } from './dto/update-titan.dto';
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

@Controller('titans')
@ApiTags('Titans')
export class TitansController {
  constructor(private readonly titansService: TitansService) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'finds all titans in the database' })
  @ApiResponse({ status: 200, description: 'Titans found' })
  @Get()
  async findAll(
    @Query() pagination: PaginateDto,
  ): Promise<PaginatedResponse<Titan>> {
    return this.titansService.findAll(pagination);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'finds a titan by id' })
  @ApiResponse({ status: 200, description: 'Titan found' })
  @ApiResponse({ status: 404, description: 'Titan not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Titan> {
    const titan = await this.titansService.findOne(id);

    if (!titan) {
      throw new NotFoundException(`Titan with id ${id} not found`);
    }

    return titan;
  }

  @ApiOperation({ summary: 'creates a new titan' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 201, description: 'Titan created' })
  @ApiResponse({ status: 404, description: 'Titan not found' })
  @Post()
  async create(@Body() dto: CreateTitanDto): Promise<Titan> {
    return this.titansService.create(dto);
  }

  @ApiOperation({ summary: 'updates fields of a titan by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 200, description: 'Titan updated' })
  @ApiResponse({ status: 404, description: 'Titan not found' })
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

  @ApiOperation({ summary: 'removes a titan by id' })
  @ApiBearerAuth('x-api-key')
  @ApiResponse({ status: 200, description: 'Titan deleted' })
  @ApiResponse({ status: 404, description: 'Titan not found' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const titan = await this.titansService.findOne(id);

    if (!titan) {
      throw new NotFoundException(`Titan with id ${id} not found`);
    }

    return this.titansService.remove(id);
  }
}
