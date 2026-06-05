import { Test, TestingModule } from '@nestjs/testing';
import { TitansService } from './titans.service';

describe('TitansService', () => {
  let service: TitansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TitansService],
    }).compile();

    service = module.get<TitansService>(TitansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
