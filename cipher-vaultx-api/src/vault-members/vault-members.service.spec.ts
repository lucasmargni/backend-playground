import { Test, TestingModule } from '@nestjs/testing';
import { VaultMembersService } from './vault-members.service';

describe('VaultMembersService', () => {
  let service: VaultMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VaultMembersService],
    }).compile();

    service = module.get<VaultMembersService>(VaultMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
