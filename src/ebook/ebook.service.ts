import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EbookEntity } from 'src/entities/ebook.entity';
import { EbookSeriesEntity } from 'src/entities/ebookSeries.entity';
import { GetToken } from 'src/utils/GetToken';
import { Page } from 'src/utils/Page';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class EbookService {
  private readonly logger = new Logger(EbookService.name);
  constructor(
    @InjectRepository(EbookEntity)
    private readonly ebookRepository: Repository<EbookEntity>,
    @InjectRepository(EbookSeriesEntity)
    private readonly ebookSeriesRepository: Repository<EbookSeriesEntity>,
    private readonly jwtService: JwtService,
    private readonly getToken: GetToken,
    private dataSource: DataSource,
  ) {}

  async getTotalCount() {
    try {
      const count = await this.ebookRepository.query(`
        select
          count(*)
        from ebook
        where "isDeleted" = false
        and "adminCheck" = true
      `);
      return count[0].count;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 개수 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getEbookUserId(id: number) {
    try {
      const ebook = await this.ebookRepository
        .createQueryBuilder()
        .select(['"userId"'])
        .where('id = :id', { id: id })
        .andWhere('"isDeleted" = :isDeleted', { isDeleted: false })
        .getRawOne();

      return ebook.userId;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook userId 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**ebook 전체 조회 */
  async getAll(): Promise<object> {
    try {
      const ebook = await this.ebookRepository.query(
        `select
          a.id,
          title,
          "dateTime",
          nickname,
          "category",
          "starRating"
        from ebook a
        inner join (
          select
            "id",
            nickname
            from "user"
        ) b
        on a."userId" = b.id
        inner join (
          select
            "id",
            "category"
            from "boardCategory"
        ) c
        on a."boardCategoryId" = c.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) d
        on a.id = d."ebookId"
        where "isDeleted" = false
        and "adminCheck" = true
        `,
      );
      return ebook;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param id userId:number
   * @returns ebook getOne
   */
  async getOne(id): Promise<object> {
    try {
      const ebook = await this.ebookRepository.query(
        `select
            a.id,
            title,
            "dateTime",
            nickname,
            "category",
            contents,
            "starRating"
            from ebook a
            inner join (
              select
                "id",
                nickname
                from "user"
          ) b
          on a."userId" = b.id
          inner join (
              select
                "id",
                "category"
                from "boardCategory"
          ) c
          on a."boardCategoryId" = c.id
          left join (
            select
              "ebookId",
              round(avg("starRating"), 2) as "starRating"
            from "ebookStarRating"
            group by "ebookId"
          ) d
          on a.id = d."ebookId"
          where "isDeleted" = false
          and "adminCheck" = true
          and a.id = ${id}
          `,
      );

      const res = ebook[0]
        ? ebook[0]
        : { success: false, msg: '존재하지 않는 게시글입니다' };

      return res;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param createEbookDto
   * @param headers
   * @returns object {success:true}
   */
  async create(createEbookDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      const ebookData = new EbookEntity();
      ebookData.title = createEbookDto.title;
      ebookData.contents = createEbookDto.contents;
      ebookData.dateTime = new Date();
      ebookData.boardCategory = createEbookDto.boardCategoryId;
      ebookData.user = verified.userId;
      ebookData.adminCheck = false;
      ebookData.isDeleted = false;
      ebookData.isModified = false;

      await this.ebookRepository.save(ebookData);

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 작성 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param id :number
   * @param headers
   * @returns
   */
  async getUpdate(id, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      const userId = await this.getEbookUserId(id);

      if (userId === verified.userId) {
        return await this.getOne(id);
      } else return { success: false, msg: '유저 불일치' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 수정 전 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param updateEbookDto
   * @param headers
   * @returns object {success:true}
   */
  async update(updateEbookDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      await this.ebookRepository
        .createQueryBuilder()
        .update()
        .set({
          title: updateEbookDto.title,
          contents: updateEbookDto.contents,
          boardCategory: updateEbookDto.boardCategoryId,
          isModified: true,
        })
        .where('id = :id', { id: updateEbookDto.id })
        .andWhere('userId = :userId', { userId: verified.userId })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param deleteEbookDto
   * @param headers
   * @returns object {success:true}
   */
  async delete(deleteEbookDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      await this.ebookRepository
        .createQueryBuilder()
        .update()
        .set({
          isDeleted: true,
        })
        .where('id = :id', { id: deleteEbookDto.id })
        .andWhere('userId = :userId', { userId: verified.userId })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   *
   * @param starRateDto
   * @param headers
   * @returns object {success: true, msg: 'create starRating' || 'update StarRating'}
   */
  async starRate(starRateDto, headers) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const verified = await this.getToken.getToken(headers);
      const starRateData = {
        starRating: starRateDto.starRating,
        userId: verified.userId,
        ebookId: starRateDto.ebookId,
      };
      const check = await this.checkStarRating(
        starRateData.userId,
        starRateData.ebookId,
        queryRunner,
      );
      console.log(typeof check[0].count);
      const res = await this.checkAndCall(
        check[0].count,
        starRateData,
        queryRunner,
      );

      if (res['success']) {
        await queryRunner.commitTransaction();
        return res;
      } else {
        this.logger.error('별점 부여 중 에러 발생');
        await queryRunner.rollbackTransaction();
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          msg: '별점 부여 중 에러 발생',
        };
      }
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 부여 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async checkStarRating(userId, ebookId, queryRunner) {
    try {
      const res = await queryRunner.query(
        `select
          count(*) from "ebookStarRating"
          where "userId" = ${userId}
          and "ebookId" = ${ebookId}`,
      );
      return res;
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async checkAndCall(check, starRateData, queryRunner) {
    try {
      let res;
      if (check === '1') {
        res = await this.updateStarRating(starRateData, queryRunner);
      } else {
        res = await this.createStarRating(starRateData, queryRunner);
      }
      return res;
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 체크 후 함수 호출 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async createStarRating(starRateData, queryRunner) {
    try {
      await queryRunner.query(`
        insert into "ebookStarRating"
        ("starRating", "userId", "ebookId")
        values (${starRateData.starRating},
          ${starRateData.userId},
          ${starRateData.ebookId})
      `);

      const starRatingAvg = await this.getStarRatingAvg(
        starRateData.ebookId,
        queryRunner,
      );

      return {
        success: true,
        msg: 'create starRating',
        starRatingAvg: starRatingAvg,
      };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 생성 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
  async updateStarRating(starRateData, queryRunner) {
    try {
      await queryRunner.query(`
        update "ebookStarRating"
          set
            "starRating" = ${starRateData.starRating}
          where
            "userId" = ${starRateData.userId}
          and
            "ebookId" = ${starRateData.ebookId}
      `);

      const starRatingAvg = await this.getStarRatingAvg(
        starRateData.ebookId,
        queryRunner,
      );

      return {
        success: true,
        msg: 'update starRating',
        starRatingAvg: starRatingAvg,
      };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 업데이트 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getStarRatingAvg(ebookId, queryRunner) {
    try {
      const starRating = await queryRunner.query(`
        select round(avg("starRating"), 2) as "starRating" from "ebookStarRating" where "ebookId" = ${ebookId}
      `);
      return starRating[0].starRating;
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook 별점 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getEbookOrderByStarRating(page) {
    try {
      const count = await this.getTotalCount();
      const offset = page.getOffset();
      const limit = page.getLimit();
      const ebook = await this.ebookRepository.query(
        `select
          a.id,
          title,
          "dateTime",
          nickname,
          "category",
          "starRating"
        from ebook as a
        join (
          select
            "id"
            from ebook
            where ebook."isDeleted" = false
            and ebook."adminCheck" = true
            offset ${offset}
            limit ${limit}
        ) as temp
        on temp.id = a.id
        inner join (
          select
            "id",
            nickname
            from "user"
        ) b
        on a."userId" = b.id
        inner join (
          select
            "id",
            "category"
            from "boardCategory"
        ) c
        on a."boardCategoryId" = c.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) d
        on a.id = d."ebookId"
        order by "starRating" desc
        `,
      );

      return new Page(count, page.pageSize, ebook);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '별점순 ebook 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  //series 관련
  async getSeries(headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const series = await this.ebookSeriesRepository.query(`
        select id, "seriesName", "userId" from "ebookSeries" where "userId" = ${verified.userId} and "isDeleted" = false
      `);
      return series;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '해당 유저 시리즈 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async createSeries(createSeriesDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const series = new EbookSeriesEntity();
      series.user = verified.userId;
      series.seriesName = createSeriesDto.seriesName;
      series.isDeleted = false;

      await this.ebookSeriesRepository.save(series);
      const allSeries = await this.getSeries(headers);
      return { success: true, series: allSeries };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '시리즈 생성 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
}
