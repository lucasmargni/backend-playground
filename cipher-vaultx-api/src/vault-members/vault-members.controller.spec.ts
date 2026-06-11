import { Test, TestingModule } from '@nestjs/testing';
import { VaultMembersController } from './vault-members.controller';

describe('VaultMembersController', () => {
  let controller: VaultMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaultMembersController],
    }).compile();

    controller = module.get<VaultMembersController>(VaultMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
