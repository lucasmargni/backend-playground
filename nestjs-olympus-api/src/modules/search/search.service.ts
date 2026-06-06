import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { God } from '../gods/god.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { Titan } from '../titans/titan.entity';
import { Myth } from '../myths/myth.entity';
import { SearchDto, SearchType } from './dto/search.do';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(God)
    private readonly godRepository: Repository<God>,
    @InjectRepository(Titan)
    private readonly titanRepository: Repository<Titan>,
    @InjectRepository(Myth)
    private readonly mythRepository: Repository<Myth>,
  ) {}

  private async searchInRepository<T extends ObjectLiteral>(
    repository: Repository<T>,
    alias: string,
    fields: string[],
    q: string,
  ): Promise<T[]> {
    const vectorExpr = fields.map((f) => `${alias}.${f}`).join(` || ' ' || `);

    return repository
      .createQueryBuilder(alias)
      .where(`to_tsvector(${vectorExpr}) @@ plainto_tsquery(:q)`, { q })
      .getMany();
  }

  async search(dto: SearchDto): Promise<(God | Titan | Myth)[]> {
    const { q, type } = dto;

    if (type === SearchType.GOD) {
      return this.searchInRepository(
        this.godRepository,
        'god',
        ['name', 'description'],
        q,
      );
    }

    if (type === SearchType.TITAN) {
      return this.searchInRepository(
        this.titanRepository,
        'titan',
        ['name', 'description'],
        q,
      );
    }

    if (type === SearchType.MYTH) {
      return this.searchInRepository(
        this.mythRepository,
        'myth',
        ['title', 'summary'],
        q,
      );
    }

    /* if type does not match, search in all */
    const [gods, titans, myths] = await Promise.all([
      this.searchInRepository(
        this.godRepository,
        'god',
        ['name', 'description'],
        q,
      ),
      this.searchInRepository(
        this.titanRepository,
        'titan',
        ['name', 'description'],
        q,
      ),
      this.searchInRepository(
        this.mythRepository,
        'myth',
        ['title', 'summary'],
        q,
      ),
    ]);

    return [...gods, ...titans, ...myths];
  }
}
