import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardEntity } from 'src/entities/board.entity';
import { Repository } from 'typeorm';
import { BoardRepository } from './repository/board.repository';

const MockBoardRepository = () => ({
  find:jest.fn(),
});

type MockRepository<T=any> = Partial<Record<keyof Repository<T>, jest.Mock>>;


describe('BoardController', () => {
  let controller: BoardController;
  let boardService : BoardService;
  let boardRepository : MockRepository<BoardEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers : [
        BoardService,{
          provide:getRepositoryToken(BoardRepository),
          useValue : MockBoardRepository(),

        }
      ]
    }).compile();

    controller = module.get<BoardController>(BoardController);
    boardService =  module.get<BoardService>(BoardService);
    boardRepository = module.get(getRepositoryToken(BoardRepository))

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
