import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';
import { BoardEntity } from 'src/entities/board.entity';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(private readonly boardRepository: BoardRepository) {}

  /**
   *get all boards with nickname
   */
  async getAll() {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select([//leftjoinandselect 사용 시 user의 비밀번호, 이메일 등 불필요한 정보가 넘어가는 것을 확인했습니다 혹시
          'board.id',//leftjoinandselect를 사용해야 하는 다른 이유가 있을까요??
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommand',
          'board.boardCategoryId',
          'user.nickname',
        ])
        .leftJoin('board.user', 'user')
        .orderBy('board.dateTime', 'DESC')
        .getRawMany();

      return board;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시판 조회 중 에러 발생',
        },
        500,
      );
    }
  }

  /**
   * create board
   * @param createData
   */
  async create(createData) {
    const boardData = new BoardEntity();
    boardData.title = createData.title;
    boardData.contents = createData.contents;
    boardData.user = createData.userId;
    boardData.boardCategory = createData.boardCategoryId;
    boardData.dateTime = new Date();
    boardData.isDeleted = false;
    boardData.isModified = false;
    boardData.recommand = 0;
    try {
      const board = await this.boardRepository
        .createQueryBuilder()
        .insert()
        .into('board')
        .values({
          title: boardData.title,
          contents: boardData.contents,
          dateTime: boardData.dateTime,
          isDeleted: boardData.isDeleted,
          isModified: boardData.isModified,
          recommand: boardData.recommand,
          user: boardData.user,
          boardCategory: boardData.boardCategory,
        })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시판 생성 중 에러 발생',
        },
        500,
      );
    }
  }
}
