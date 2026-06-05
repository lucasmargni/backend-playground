import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Myth } from './myth.entity';
import { Repository } from 'typeorm';
import { CreateMythDto } from './dto/create-myth.dto';
import { UpdateMythDto } from './dto/update-myth.dto';

@Injectable()
export class MythsService {
  constructor(
    @InjectRepository(Myth)
    private readonly mythRepository: Repository<Myth>,
  ) {}

  findAll(): Promise<Myth[]> {
    return this.mythRepository.find({ relations: { characters: true } });
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
