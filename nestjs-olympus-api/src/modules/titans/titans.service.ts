import { Injectable } from '@nestjs/common';
import { Titan } from './titan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTitanDto } from './dto/create-titan.dto';
import { UpdateTitanDto } from './dto/update-titan.dto';

@Injectable()
export class TitansService {
  constructor(
    @InjectRepository(Titan)
    private readonly titanRepository: Repository<Titan>,
  ) {}

  findAll(): Promise<Titan[]> {
    return this.titanRepository.find();
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
