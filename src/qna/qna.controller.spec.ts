import { Test, TestingModule } from '@nestjs/testing';
import { QnaController } from './qna.controller';
import { QnaCommentService } from './qnaComment.service';
import { QnaService } from './qna.service';

describe('QnaController', () => {
  let controller: QnaController;
  let provider: QnaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QnaController],
      providers:[QnaCommentService],
    }).compile();

    controller = module.get<QnaController>(QnaController);
    provider=module.get<QnaService>(QnaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
