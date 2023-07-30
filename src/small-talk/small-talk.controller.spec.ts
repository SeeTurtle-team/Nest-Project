import { Test, TestingModule } from '@nestjs/testing';
import { SmallTalkController } from './small-talk.controller';

describe('SmallTalkController', () => {
  let controller: SmallTalkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmallTalkController],
    }).compile();

    controller = module.get<SmallTalkController>(SmallTalkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
