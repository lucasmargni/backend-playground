import { Test, TestingModule } from '@nestjs/testing';
import { TitansController } from './titans.controller';

describe('TitansController', () => {
  let controller: TitansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TitansController],
    }).compile();

    controller = module.get<TitansController>(TitansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
