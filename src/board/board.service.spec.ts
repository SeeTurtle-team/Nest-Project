import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { Repository } from 'typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardRepository } from './repository/board.repository';

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
          provide:getRepositoryToken(BoardRepository),
          useValue : MockBoardRepository(),
        }
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get(getRepositoryToken(BoardRepository))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
