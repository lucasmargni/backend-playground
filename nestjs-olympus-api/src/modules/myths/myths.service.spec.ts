import { Test, TestingModule } from '@nestjs/testing';
import { MythsService } from './myths.service';

describe('MythsService', () => {
  let service: MythsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MythsService],
    }).compile();

    service = module.get<MythsService>(MythsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
