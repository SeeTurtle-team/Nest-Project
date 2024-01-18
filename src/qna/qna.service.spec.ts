import { Test, TestingModule } from '@nestjs/testing';
import { QnaService } from './qna.service';
import { Page } from 'src/utils/Page';
import { GetToken } from 'src/utils/GetToken';
import { GetSearchSql } from 'src/utils/GetSearchSql';
import { QnaCommentService } from './qnaComment.service';
describe('QnaService', () => {
  let service: QnaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QnaService,GetToken,GetSearchSql,QnaCommentService],
    }).compile();

    service = module.get<QnaService>(QnaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getAllComment',()=>
  {
    it('getAllComment',async ()=>
    {
      const spy=jest.spyOn(service,'getAllComment');
      await service.getAllComment(1);
      expect(spy).toBeCalledTimes(1);
    })
  });
});
