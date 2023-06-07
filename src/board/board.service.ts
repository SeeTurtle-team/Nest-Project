import { Injectable, Logger } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(private readonly repository: BoardRepository) {}

  async getAll() {
    const query = `select b.title, b.contents, b."userId", b.recommand, b."dateTime", b."boardCategoryId",
    u.nickname, u.img
    from board b, public.user u
    order by "dateTime" desc`;
    try {
      return await this.repository.query(query);
    } catch (err) {
      this.logger.error('게시판 조회 중 에러 발생');
    }
  }
}
