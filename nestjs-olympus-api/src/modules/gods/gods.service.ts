import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { God } from './god.entity';
import { Repository } from 'typeorm';
import { CreateGodDto } from './dto/create-god.dto';
import { UpdateGodDto } from './dto/update-god.dto';
import { MythologicalBeing } from '../beings/being.entity';
import { Myth } from '../myths/myth.entity';
import { PaginateDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class GodsService {
  constructor(
    @InjectRepository(God)
    private readonly godRepository: Repository<God>,
    @InjectRepository(MythologicalBeing)
    private readonly beingRepository: Repository<MythologicalBeing>,
  ) {}

  async findAll(pagination: PaginateDto): Promise<PaginatedResponse<God>> {
    const { page, limit } = pagination;

    const [data, total] = await this.godRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<God | null> {
    return this.godRepository.findOneBy({ id });
  }

  async findParents(id: string): Promise<MythologicalBeing[] | null> {
    const god = await this.godRepository.findOne({
      where: { id },
      relations: { parents: true },
    });

    if (!god) {
      return null;
    }

    return god.parents;
  }

  async findChildren(id: string): Promise<MythologicalBeing[] | null> {
    const god = await this.godRepository.findOne({
      where: { id },
      relations: { children: true },
    });

    if (!god) {
      return null;
    }

    return god.children;
  }

  async findMyths(id: string): Promise<Myth[] | null> {
    const god = await this.godRepository.findOne({
      where: { id },
      relations: { myths: true },
    });

    if (!god) {
      return null;
    }

    return god.myths;
  }

  create(dto: CreateGodDto): Promise<God> {
    const newGod = this.godRepository.create(dto);
    return this.godRepository.save(newGod);
  }

  async addParent(id: string, parentId: string): Promise<God> {
    const god = await this.godRepository.findOne({
      where: { id },
      relations: { parents: true },
    });

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    const parent = await this.beingRepository.findOneBy({ id: parentId });

    if (!parent) {
      throw new NotFoundException(`Being with id ${parentId} not found`);
    }

    god.parents.push(parent);

    await this.godRepository.save(god);

    return god;
  }

  async update(id: string, dto: UpdateGodDto): Promise<God | null> {
    await this.godRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.godRepository.delete(id);
  }

  async removeParent(id: string, parentId: string): Promise<God> {
    const god = await this.godRepository.findOne({
      where: { id },
      relations: { parents: true },
    });

    if (!god) {
      throw new NotFoundException(`God with id ${id} not found`);
    }

    const parent = await this.beingRepository.findOneBy({ id: parentId });

    if (!parent) {
      throw new NotFoundException(`Being with id ${parentId} not found`);
    }

    god.parents = god.parents.filter((p) => p.id !== parentId);

    await this.godRepository.save(god);

    return god;
  }
}
