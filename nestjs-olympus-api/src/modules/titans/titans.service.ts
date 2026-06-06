import { Injectable } from '@nestjs/common';
import { Titan } from './titan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTitanDto } from './dto/create-titan.dto';
import { UpdateTitanDto } from './dto/update-titan.dto';
import { PaginateDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class TitansService {
  constructor(
    @InjectRepository(Titan)
    private readonly titanRepository: Repository<Titan>,
  ) {}

  async findAll(pagination: PaginateDto): Promise<PaginatedResponse<Titan>> {
    const { page, limit } = pagination;

    const [data, total] = await this.titanRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<Titan | null> {
    return this.titanRepository.findOneBy({ id });
  }

  create(dto: CreateTitanDto): Promise<Titan> {
    const newTitan = this.titanRepository.create(dto);
    return this.titanRepository.save(newTitan);
  }

  async update(id: string, dto: UpdateTitanDto): Promise<Titan | null> {
    await this.titanRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.titanRepository.delete(id);
  }
}
