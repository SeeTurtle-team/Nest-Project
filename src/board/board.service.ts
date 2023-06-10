import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';
import { BoardEntity } from 'src/entities/board.entity';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(private readonly boardRepository: BoardRepository) {}

  /**
   * get all boards with nickname
   * @return board
   */
  async getAll() {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select([
          'board.id',
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommand',
          'board.boardCategoryId',
          'user.nickname',
        ])
        .where('"isDeleted" = :isDeleted', { isDeleted: false })
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
   * @return success: true
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
      await this.boardRepository
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

  /**
   * delete board
   * @param deleteData
   * @return success: true
   */
  async delete(deleteData) {
    try {
      await this.boardRepository
        .createQueryBuilder('board')
        .update()
        .set({
          isDeleted: true,
        })
        .where('id = :id', { id: deleteData.id })
        .andWhere('userId = :userId', { userId: deleteData.userId })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시판 삭제 중 에러 발생',
        },
        500,
      );
    }
  }

  /**
   * update board
   * @param updateData
   * @returns success: true
   */
  async update(updateData) {
    const boardData = new BoardEntity();
    boardData.id = updateData.id;
    boardData.title = updateData.title;
    boardData.contents = updateData.contents;
    boardData.user = updateData.userId;
    boardData.boardCategory = updateData.boardCategoryId;
    boardData.isModified = true;
    try {
      await this.boardRepository
        .createQueryBuilder('board')
        .update()
        .set({
          title: boardData.title,
          contents: boardData.contents,
          boardCategory: boardData.boardCategory,
          isModified: boardData.isModified,
        })
        .where('id = :id', { id: boardData.id })
        .andWhere('userId = :userId', { userId: boardData.user })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시판 수정 중 에러 발생',
        },
        500,
      );
    }
  }

  /**
   * get one board
   * @param number - id
   * @returns one board
   */
  async getOne(id) {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select()
        .where('id = :id', { id: id })
        .getRawMany();

      return board;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시글 조회 중 에러 발생',
        },
        500,
      );
    }
  }

  /**
   * get typed board
   * @param type
   * @returns typed board
   */
  async getTyped(type) {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select([
          'board.id',
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommand',
          'board.boardCategoryId',
          'user.nickname',
        ])
        .where('"isDeleted" = :isDeleted', { isDeleted: false })
        .andWhere('"boardCategoryId" = :boardCategoryId', {
          boardCategoryId: type.boardCategoryId,
        })
        .leftJoin('board.user', 'user')
        .orderBy('board.dateTime', 'DESC')
        .getRawMany();

      return board;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '타입 별 게시판 조회 중 에러 발생',
        },
        500,
      );
    }
  }
}
