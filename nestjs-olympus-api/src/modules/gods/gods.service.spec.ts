import { Test, TestingModule } from '@nestjs/testing';
import { GodsService } from './gods.service';

describe('GodsService', () => {
  let service: GodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GodsService],
    }).compile();

    service = module.get<GodsService>(GodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
