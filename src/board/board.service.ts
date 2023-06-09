import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';

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
        .select([
          'board.id',    //id 값을 넘겨주어야 프론트에서 처리가 가능합니다
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
          status: HttpStatus.NOT_FOUND,
          error: '게시판 조회 중 에러 발생',
        },
        404,
      );
    }
  }
}
