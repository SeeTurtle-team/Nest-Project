import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { Repository } from 'typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const MockBoardRepository = () => ({
  find:jest.fn(),
});

type MockRepository<T=any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('BoardService', () => {
  let service: BoardService;
  let boardRepository : MockRepository<BoardEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,{
          provide:getRepositoryToken(BoardEntity),
          useValue : MockBoardRepository(),
        }
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get<MockRepository<BoardEntity>>(
      getRepositoryToken(BoardEntity)
    )
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
