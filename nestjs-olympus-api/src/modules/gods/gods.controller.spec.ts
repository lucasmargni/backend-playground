import { Test, TestingModule } from '@nestjs/testing';
import { GodsController } from './gods.controller';

describe('GodsController', () => {
  let controller: GodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GodsController],
    }).compile();

    controller = module.get<GodsController>(GodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
