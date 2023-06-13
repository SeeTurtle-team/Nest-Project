import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';
import { BoardEntity } from 'src/entities/board.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(
    private readonly boardRepository: BoardRepository,
    private dataSource: DataSource,
  ) { }

  /**
   * get all boards with nickname
   * @return board
   */
  async getAll(): Promise<object> {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select([
          'board.id',
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommend',
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
  async create(createData): Promise<object> {
    try {
      const boardData = new BoardEntity();
      boardData.title = createData.title;
      boardData.contents = createData.contents;
      boardData.user = createData.userId;
      boardData.boardCategory = createData.boardCategoryId;
      boardData.dateTime = new Date();
      boardData.isDeleted = false;
      boardData.isModified = false;
      boardData.recommend = 0;

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
          recommend: boardData.recommend,
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
  async delete(deleteData): Promise<object> {
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
  async update(updateData): Promise<object> {
    try {
      const boardData = new BoardEntity();
      boardData.id = updateData.id;
      boardData.title = updateData.title;
      boardData.contents = updateData.contents;
      boardData.user = updateData.userId;
      boardData.boardCategory = updateData.boardCategoryId;
      boardData.isModified = true;

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
  async getOne(id): Promise<object> {
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
  async getTyped(type): Promise<object> {
    try {
      const board = await this.boardRepository
        .createQueryBuilder('board')
        .select([
          'board.id',
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommend',
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

  /**
   * recommend board
   * @param recommendData
   * @returns success: true, msg: 'create recommend' | 'cancle recommend' | 'reRecommend'
   */
  async recommend(recommendData): Promise<object> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const check = await this.checkRecommend(
        recommendData.boardId,
        recommendData.userId,
        queryRunner,
      );

      const res = await this.checkAndCall(check, recommendData, queryRunner);

      if (res['success']) {
        await queryRunner.commitTransaction();
        return res;
      } else {
        await queryRunner.rollbackTransaction();
        return { success: false, msg: '게시글 추천 중 에러 발생' };
      }
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시글 추천 중 에러 발생',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async checkRecommend(boardId, userId, queryRunner) {
    try {
      const res = await queryRunner.query(
        `select * from public."boardRecommend" where "userId" = ${userId} and "boardId" = ${boardId}`,
      );

      return res;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '추천 체크 중 에러 발생',
        },
        500,
      );
    }
  }

  async checkAndCall(check, recommendData, queryRunner) {
    try {
      let res;
      if (!!check[0]) {
        if (check[0].check) {
          res = await this.cancelRecommend(
            recommendData.boardId,
            recommendData.userId,
            queryRunner,
          );
        } else {
          res = await this.reRecommend(
            recommendData.boardId,
            recommendData.userId,
            queryRunner,
          );
        }
      } else {
        res = await this.createRecommend(
          recommendData.boardId,
          recommendData.userId,
          queryRunner,
        );
      }
      return res;

    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '체크 확인 후 함수 호출 중 에러 발생',
        },
        500,
      );
    }
  }

  async createRecommend(boardId, userId, queryRunner) {
    try {
      await queryRunner.query(
        `insert into "boardRecommend"("check", "userId", "boardId") values(TRUE, ${userId}, ${boardId})`,
      );

      await this.changeRecommendCount(1, boardId, queryRunner);

      return { success: true, msg: 'create recommend' };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '추천 생성 중 에러 발생',
        },
        500,
      );
    }
  }

  async cancelRecommend(boardId, userId, queryRunner) {
    try {
      await queryRunner.query(
        `UPDATE "boardRecommend" set "check" = FALSE where "boardId" = ${boardId} and "userId" = ${userId}`,
      );

      await this.changeRecommendCount(-1, boardId, queryRunner);

      return { success: true, msg: 'cancel recommend' };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '추천 취소 중 에러 발생',
        },
        500,
      );
    }
  }

  async reRecommend(boardId, userId, queryRunner) {
    try {
      await queryRunner.query(
        `UPDATE "boardRecommend" set "check" = TRUE where "boardId" = ${boardId} and "userId" = ${userId}`,
      );

      await this.changeRecommendCount(1, boardId, queryRunner);

      return { success: true, msg: 'reRecommend' };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '재추천 중 에러 발생',
        },
        500,
      );
    }
  }

  async changeRecommendCount(num, boardId, queryRunner) {
    try {
      const count = await queryRunner.query(
        `select recommend from board where id = ${boardId}`,
      );

      await queryRunner.query(
        `UPDATE "board" set recommend = ${count[0].recommend + num
        } where id = ${boardId}`,
      );

      return { success: true, msg: 'change count' };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '추천 수 수정 중 에러 발생',
        },
        500,
      );
    }
  }
}
