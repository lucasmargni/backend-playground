import { Test, TestingModule } from '@nestjs/testing';
import { MythsController } from './myths.controller';

describe('MythsController', () => {
  let controller: MythsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MythsController],
    }).compile();

    controller = module.get<MythsController>(MythsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
