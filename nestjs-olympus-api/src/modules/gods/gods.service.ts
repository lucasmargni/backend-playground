import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { God } from './god.entity';
import { Repository } from 'typeorm';
import { CreateGodDto } from './dto/create-god.dto';
import { UpdateGodDto } from './dto/update-god.dto';

@Injectable()
export class GodsService {
  constructor(
    @InjectRepository(God)
    private readonly godRepository: Repository<God>,
  ) {}

  findAll(): Promise<God[]> {
    return this.godRepository.find();
  }

  findOne(id: string): Promise<God | null> {
    return this.godRepository.findOneBy({ id });
  }

  create(dto: CreateGodDto): Promise<God> {
    const newGod = this.godRepository.create(dto);
    return this.godRepository.save(newGod);
  }

  async update(id: string, dto: UpdateGodDto): Promise<God | null> {
    await this.godRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.godRepository.delete(id);
  }
}
