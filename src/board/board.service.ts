import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BoardRepository } from './repository/board.repository';
import { BoardEntity } from 'src/entities/board.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardNotifyEntity } from 'src/entities/boardNotify.entity';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: Repository<BoardEntity>,
    @InjectRepository(BoardNotifyEntity)
    private readonly boardNofityRepository: Repository<BoardNotifyEntity>,
    private dataSource: DataSource,
  ) {}

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
          'board.contents',
          'board.title',
          'board.dateTime',
          'board.isDeleted',
          'board.isModified',
          'board.recommend',
          'board.boardCategoryId',
          'user.nickname',
        ])
        .where('"isDeleted" = :isDeleted', { isDeleted: false })
        .andWhere('"ban" = :ban', { ban: false })
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
          success: false,
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
      boardData.ban = false;
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
          ban: boardData.ban,
        })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시판 생성 중 에러 발생',
          success: false,
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
          success: false,
        },
        500,
      );
    }
  }

  async checkUser(ids) {
    try {
      const id = await this.boardRepository
        .createQueryBuilder()
        .select('"userId"')
        .where('id = :boardId', { boardId: ids.boardId })
        .getRawOne();
      if (ids.userId === id.userId) {
        return true;
      } else return false;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param ids
   * @returns board
   */
  async getUpdate(ids): Promise<object> {
    try {
      const check = await this.checkUser(ids);
      if (check) {
        const board = await this.getOne(ids.boardId);

        return board;
      } else {
        this.logger.log('not same user');
        return { success: false, msg: '유저 불일치' };
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '업데이트 전 가져오기 중 에러 발생',
          success: false,
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
          success: false,
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
        .getOne();

      return board;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시글 조회 중 에러 발생',
          success: false,
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
          success: false,
        },
        500,
      );
    }
  }

  /**
   * recommend board
   * @param recommendData
   * @returns success: true, msg: 'create recommend' | 'cancle recommend' | 'reRecommend, recommend: ${recommend}'
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
        this.logger.error('게시글 추천 중 에러 발생');
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
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
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
          success: false,
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
        `UPDATE "board" set recommend = ${
          count[0].recommend + num
        } where id = ${boardId}`,
      );

      return { success: true, msg: 'change count' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '추천 수 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**신고 리스트 불러오기 */
  async getNotiList() {
    try {
      const res = await this.boardNofityRepository
        .createQueryBuilder('boardNotify')
        .select()
        .where('"IsDeleted" =:IsDeleted ', { IsDeleted: false })
        .getMany();

      return res;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '신고 리스트 불러오기 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**신고 접수 */
  async insertNotify(notifyDto) {
    try {
      const boardNotifyEntity = new BoardNotifyEntity();

      boardNotifyEntity.reason = notifyDto.reason;
      boardNotifyEntity.dateTime = new Date();
      boardNotifyEntity.IsChecked = false;
      boardNotifyEntity.IsDeleted = false;
      boardNotifyEntity.board = notifyDto.boardId;
      boardNotifyEntity.user = notifyDto.userId;

      await this.boardNofityRepository.save(boardNotifyEntity);

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '신고 접수 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**신고 접수 후 게시물 밴 */
  async banBoard(banBoardDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //유저 권한 체크 jwt 이후 추가 예정

      const res = await this.banBoardCotents(banBoardDto.boardId, queryRunner);

      if (res['success']) {
        await this.checkBoardNotiy(banBoardDto.boardNotifyId, queryRunner);
      } else {
        this.logger.error('글 추천 중 에러 발생');
        await queryRunner.rollbackTransaction();
        return res;
      }

      await queryRunner.commitTransaction();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '신고 접수 후 게시물 밴 중 에러 발생',
          success: false,
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**게시물 밴 처리 */
  async banBoardCotents(boardId, queryRunner) {
    try {
      await queryRunner.query(
        `UPDATE "board" set "ban" = true where "id" = ${boardId}`,
      );

      return { success: true, msg: '게시물 밴' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '게시물 밴 처리 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**신고 삭제 */
  async checkBoardNotiy(boardNotifyId, queryRunner) {
    try {
      await queryRunner.query(
        `UPDATE "boardNotify" set "IsDeleted" = true where "id" = ${boardNotifyId}`,
      );

      return { success: true, msg: '신고 삭제' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '신고 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
}
