import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EbookEntity } from 'src/entities/ebook.entity';
import { EbookImgEntity } from 'src/entities/ebookImg.entity';
import { EbookSeriesEntity } from 'src/entities/ebookSeries.entity';
import { checkTokenId } from 'src/utils/CheckToken';
import { GetToken } from 'src/utils/GetToken';
import { Page } from 'src/utils/Page';
import { DataSource, Repository } from 'typeorm';
import { GetS3Url } from 'src/utils/GetS3Url';
import { EbookHistoryEntity } from 'src/entities/ebookHistory.entity';
import { ebookHistoryFlag } from 'src/Common/ebookHistoryFlag';

@Injectable()
export class EbookService {
  private readonly logger = new Logger(EbookService.name);
  constructor(
    @InjectRepository(EbookEntity)
    private readonly ebookRepository: Repository<EbookEntity>,
    @InjectRepository(EbookSeriesEntity)
    private readonly ebookSeriesRepository: Repository<EbookSeriesEntity>,
    @InjectRepository(EbookImgEntity)
    private readonly ebookImgRepository: Repository<EbookImgEntity>,
    @InjectRepository(EbookHistoryEntity)
    private readonly ebookHistoryRepository: Repository<EbookHistoryEntity>,
    private readonly jwtService: JwtService,
    private readonly getToken: GetToken,
    private dataSource: DataSource,
    private readonly getS3Url: GetS3Url,
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

  async getMyCount(userId) {
    try {
      const count = await this.ebookRepository.query(`
        select
          count(*)
        from ebook
        where "userId" = ${userId}
        and "isDeleted" = false
        and ban = false
      `);
      return count[0].count;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '내 ebook 개수 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getHistoryCount(userId) {
    try {
      const count = await this.ebookHistoryRepository.query(`
        select
          count(*)
        from "ebookHistory"
        where "userId" = ${userId}
        and "isDeleted" = false
      `);
      return count[0].count;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 개수 조회 중 에러 발생',
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
  async getAll(page): Promise<object> {
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
          "starRating",
          coalesce("imgUrl", 'noUrl')
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
            id,
            "imgUrl",
            "ebookId"
          from "ebookImg"
        ) d
        on d."ebookId" = a.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) e
        on a.id = e."ebookId"
        order by "dateTime" desc
        `,
      );

      return new Page(count, page.pageSize, ebook);
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
  async getOne(id, headers, historyFlag): Promise<object> {
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
        ? { ebook: ebook[0], status: HttpStatus.OK }
        : { status: HttpStatus.NOT_FOUND, msg: '존재하지 않는 게시글입니다' };

      if (historyFlag === ebookHistoryFlag.ON && res.status === HttpStatus.OK) {
        await this.historyCheckAndCall(id, headers);
      }

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
      const check = checkTokenId(userId, verified.userId);

      if (check) {
        return await this.getOne(id, headers, ebookHistoryFlag.OFF);
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
      const userId = await this.getEbookUserId(deleteEbookDto.id);
      const check = checkTokenId(userId, verified.userId);

      if (check) {
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
      } else return { success: false, msg: '유저 불일치' };
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
    } finally {
      await queryRunner.release();
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
          "starRating",
          coalesce("imgUrl", 'noUrl')
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
            id,
            "imgUrl",
            "ebookId"
          from "ebookImg"
        ) d
        on d."ebookId" = a.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) e
        on a.id = e."ebookId"
        order by "starRating" desc nulls last, "dateTime" desc
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

  async getSeriesUserId(id) {
    try {
      const series = await this.ebookSeriesRepository
        .createQueryBuilder()
        .select(['"userId"'])
        .where('id = :id', { id: id })
        .andWhere('"isDeleted" = :isDeleted', { isDeleted: false })
        .getRawOne();

      return series.userId;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '해당 시리즈 유저 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async updateSeries(updateSeriesDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = await this.getSeriesUserId(updateSeriesDto.id);
      const check = checkTokenId(userId, verified.userId);
      if (check) {
        const seriesData = new EbookSeriesEntity();
        seriesData.seriesName = updateSeriesDto.seriesName;

        await this.ebookSeriesRepository
          .createQueryBuilder()
          .update()
          .set({
            seriesName: seriesData.seriesName,
          })
          .where('id = :id', { id: updateSeriesDto.id })
          .andWhere('userId = :userId', { userId: userId })
          .execute();

        return { success: true };
      } else return { success: false, msg: '유저 불일치' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '시리즈 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async deleteSeries(deleteSeriesDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = await this.getSeriesUserId(deleteSeriesDto.id);
      const check = checkTokenId(userId, verified.userId);

      if (check) {
        await this.ebookSeriesRepository
          .createQueryBuilder()
          .update()
          .set({
            isDeleted: true,
          })
          .where('id = :id', { id: deleteSeriesDto.id })
          .andWhere('userId = :userId', { userId: userId })
          .execute();

        return { success: true };
      } else return { success: false, msg: '유저 불일치' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '시리즈 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**get s3 presigned url */
  async s3url() {
    this.logger.log('s3url');
    return {
      url: (await this.getS3Url.s3url()).data.split('?')[0],
      ok: HttpStatus.OK,
    };
  }

  /**
   * db에 있나 확인
   */
  async checkUrl(ebookId) {
    try {
      const check = await this.ebookImgRepository.query(`
        select id from "ebookImg" where "ebookId" = ${ebookId}
      `);
      return !!check[0];
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * s3url db에 저장
   */
  async insertUrl(insertUrlDto, headers) {
    try {
      const dbCheck = await this.checkUrl(insertUrlDto.ebookId);
      if (dbCheck) {
        return await this.updateUrl(insertUrlDto, headers);
      } else {
        const verified = await this.getToken.getToken(headers);
        const userId = await this.getEbookUserId(insertUrlDto.ebookId);
        const check = checkTokenId(userId, verified.userId);
        if (check) {
          const ebookImgData = new EbookImgEntity();
          ebookImgData.imgUrl = insertUrlDto.url;
          ebookImgData.ebook = insertUrlDto.ebookId;
          await this.ebookImgRepository.save(ebookImgData);

          return { success: true, status: HttpStatus.CREATED };
        } else return { success: false, msg: '유저 불일치' };
      }
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 삽입 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * url 수정
   */
  async updateUrl(updateUrlDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = await this.getEbookUserId(updateUrlDto.ebookId);
      const check = checkTokenId(userId, verified.userId);

      if (check) {
        await this.ebookImgRepository
          .createQueryBuilder()
          .update()
          .set({
            imgUrl: updateUrlDto.url,
          })
          .where('ebookId = :ebookId', { ebookId: updateUrlDto.ebookId })
          .execute();
        return { success: true, status: HttpStatus.OK };
      } else return { success: false, msg: '유저 불일치' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * url 삭제
   */
  async deleteUrl(deleteUrlDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = await this.getEbookUserId(deleteUrlDto.ebookId);
      const check = checkTokenId(userId, verified.userId);

      if (check) {
        await this.ebookImgRepository
          .createQueryBuilder()
          .update()
          .set({
            imgUrl: 'noUrl',
          })
          .where('ebookId = :ebookId', { ebookId: deleteUrlDto.ebookId })
          .execute();
        return { success: true, status: HttpStatus.OK };
      } else return { success: false, msg: '유저 불일치' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**내가 쓴 Ebook 조회*/
  async getMyEbook(page, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const count = await this.getMyCount(verified.userId);
      const offset = page.getOffset();
      const limit = page.getLimit();
      const ebook = await this.ebookRepository.query(
        `select
          a.id,
          title,
          "dateTime",
          nickname,
          "category",
          "starRating",
          "adminCheck",
          coalesce("imgUrl", 'noUrl')
        from ebook as a
        join (
          select
            "id"
            from ebook
            where ebook."userId" = ${verified.userId}
            and ebook."isDeleted" = false
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
            id,
            "imgUrl",
            "ebookId"
          from "ebookImg"
        ) d
        on d."ebookId" = a.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) e
        on a.id = e."ebookId"
        order by "dateTime" desc
        `,
      );

      return new Page(count, page.pageSize, ebook);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '내 ebook 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**history에 있는지 없는지 확인*/
  async checkHistory(ebookId, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const check = await this.ebookHistoryRepository.query(`
        select
          count(*)
        from "ebookHistory"
        where "userId" = ${verified.userId}
        and "ebookId" = ${ebookId}
      `);

      return check[0].count;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**History 존재 시 삽입 호출 없으면 업데이트 호출*/
  async historyCheckAndCall(ebookId, headers) {
    const check = await this.checkHistory(ebookId, headers);
    if (check === '1') {
      await this.updateHistory(ebookId, headers);
    } else {
      await this.insertHistory(ebookId, headers);
    }

    return { status: HttpStatus.OK };
  }

  /**ebook 열람 시 history에 추가*/
  async insertHistory(ebookId, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      const ebookHistoryData = new EbookHistoryEntity();
      ebookHistoryData.dateTime = new Date();
      ebookHistoryData.isDeleted = false;
      ebookHistoryData.user = verified.userId;
      ebookHistoryData.ebook = ebookId;

      await this.ebookHistoryRepository.save(ebookHistoryData);

      return { status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 삽입 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**ebook 재열람 시 history 업데이트*/
  async updateHistory(ebookId, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      await this.ebookHistoryRepository
        .createQueryBuilder()
        .update()
        .set({
          dateTime: new Date(),
          isDeleted: false,
        })
        .where('userId = :userId', { userId: verified.userId })
        .andWhere('ebookId = :ebookId', { ebookId: ebookId })
        .execute();

      return { status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 업데이트 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**history 삭제*/
  async deleteHistory(ebookId, headers) {
    try {
      const verified = await this.getToken.getToken(headers);

      await this.ebookHistoryRepository
        .createQueryBuilder()
        .update()
        .set({
          dateTime: new Date(),
          isDeleted: true,
        })
        .where('userId = :userId', { userId: verified.userId })
        .andWhere('ebookId = :ebookId', { ebookId: ebookId })
        .execute();

      return { status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**ebook history 열람*/
  async getEbookHistory(page, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const count = await this.getHistoryCount(verified.userId);
      const offset = page.getOffset();
      const limit = page.getLimit();
      const ebook = await this.ebookHistoryRepository.query(`
        select
          a."ebookId" as id,
          title,
          "dateTime",
          nickname,
          category,
          "starRating",
          coalesce("imgUrl", 'noUrl')
        from "ebookHistory" as a
        join(
          select
            id
          from "ebookHistory"
          where "userId" = ${verified.userId}
          and "isDeleted" = false
          order by "ebookHistory".id desc
          offset ${offset}
          limit ${limit}
        ) as temp
        on temp.id = a.id
        inner join (
          select
            id,
            title,
            "userId",
            "boardCategoryId"
          from ebook
        ) b
        on a."ebookId" = b.id
        inner join (
          select
            id,
            category
          from "boardCategory"
        ) c
        on b."boardCategoryId" = c.id
        inner join (
          select
            id,
            nickname
          from public."user"
        ) d
        on b."userId" = d.id
        left join (
          select
            id,
            "imgUrl",
            "ebookId"
          from "ebookImg"
        ) e
        on e."ebookId" = b.id
        left join (
          select
            "ebookId",
            round(avg("starRating"), 2) as "starRating"
          from "ebookStarRating"
          group by "ebookId"
        ) f
        on f."ebookId" = a."ebookId"
      `);

      return new Page(count, page.pageSize, ebook);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ebook history 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
}
