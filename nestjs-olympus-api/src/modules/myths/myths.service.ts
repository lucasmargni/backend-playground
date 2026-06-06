import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Myth } from './myth.entity';
import { Repository } from 'typeorm';
import { CreateMythDto } from './dto/create-myth.dto';
import { UpdateMythDto } from './dto/update-myth.dto';
import { PaginateDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class MythsService {
  constructor(
    @InjectRepository(Myth)
    private readonly mythRepository: Repository<Myth>,
  ) {}

  async findAll(pagination: PaginateDto): Promise<PaginatedResponse<Myth>> {
    const { page, limit } = pagination;

    const [data, total] = await this.mythRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<Myth | null> {
    return this.mythRepository.findOne({
      where: { id },
      relations: { characters: true },
    });
  }

  create(dto: CreateMythDto): Promise<Myth> {
    const newMyth = this.mythRepository.create(dto);
    return this.mythRepository.save(newMyth);
  }

  async update(id: string, dto: UpdateMythDto): Promise<Myth | null> {
    await this.mythRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.mythRepository.delete(id);
  }
}
