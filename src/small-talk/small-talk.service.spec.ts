import { Test, TestingModule } from '@nestjs/testing';
import { SmallTalkService } from './small-talk.service';

describe('SmallTalkService', () => {
  let service: SmallTalkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmallTalkService],
    }).compile();

    service = module.get<SmallTalkService>(SmallTalkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
