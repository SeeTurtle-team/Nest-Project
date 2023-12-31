import {
  ConsoleLogger,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Header } from 'aws-sdk/clients/lambda';
import { error } from 'console';
import { userGrade } from 'src/Common/userGrade';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import { GetSearchSql } from 'src/utils/GetSearchSql';
import { GetToken } from 'src/utils/GetToken';
import { Page } from 'src/utils/Page';
import { PageRequest } from 'src/utils/PageRequest';
import { QueryBuilder, Repository } from 'typeorm';
import { QnaService } from './qna.service';


@Injectable()
export class QnaCommentService {
  private readonly logger = new Logger(QnaCommentService.name);
  constructor(
    private qnaService: QnaService,
    @InjectRepository(QnaCommentEntity)
    private readonly qnaCommentRepository:
      Repository<QnaCommentEntity>,
    private readonly getToken: GetToken,
  ) { }
  async createComment(id, createQnaCommentDto, headers): Promise<Object> {
    const verified = await this.getToken.getToken(headers);
    const qnaCommentData = new QnaCommentEntity();
    qnaCommentData.title = createQnaCommentDto.title;
    qnaCommentData.contents = createQnaCommentDto.contents;
    qnaCommentData.user = verified.userId;
    qnaCommentData.username = verified.username;
    qnaCommentData.dateTime = new Date();
    qnaCommentData.isDeleted = false;
    qnaCommentData.isModified = false;
    qnaCommentData.issecret = createQnaCommentDto.issecret;
    qnaCommentData.qna = id;
    qnaCommentData.parentId = createQnaCommentDto.parnetId;
    if (!qnaCommentData.issecret) {
      qnaCommentData.username = verified.username;
    }
    await this.qnaCommentRepository.save(qnaCommentData);
    return { success: true, status: HttpStatus.OK };
  }
  catch(err) {
    this.logger.error(err);
    throw new HttpException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'QnaComment 생성중 오류발생',
      success: false,
    },
      HttpStatus.INTERNAL_SERVER_ERROR)
  }
  async getAllComment(boarId: number,
    pageRequest?: PageRequest): Promise<Object> {
    try {
      let offset = 10;
      let limit = 10;
      let pageSize = 10;
      if (pageRequest) {
        offset = pageRequest.getOffset();
        limit = pageRequest.getLimit();
        pageSize = pageRequest.pageSize;
      }
      const [count,page] = await Promise.all([this.qnaService.countAll(boarId),this.qnaCommentRepository.query(
        `select  id, title,username, "dateTime","issecret" from "qnaComment" as q where q."isDeleted"=false and q."ban"=false order by q."parentId" desc offset ${offset} limit ${limit}`)]);
      const returnPage = new Page(count, pageSize, page);
      return { success: true, Page: returnPage };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna Comment 전체조회중 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getOneComment(id: number, headers: Headers, page?): Promise<Object> {
    try {
      const isComment = true;
      const verified = await this.getToken.getToken(headers);
      const [check,page]=await Promise.all([this.qnaService.checkUserandIsSecret(id, verified.userId, isComment),this.qnaCommentRepository.query(
        `select  id, title, "dateTime",username,contents from "qnaComment" where "id"=${id} and "ban"=false and "isDeleted"=false`)]);
      if (!page) {
        throw new Error('Qna.getOneComment에서 삭제된 Qna에 접근')
      }
      return {
        success: true,
        page,
        check: check['check'],
        status: HttpStatus.OK
      };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna 조회중 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getCommentUpdate(id, headers): Promise<Object> {
    try {
      const update = await this.getOneComment(id, headers);
      const checkIsOwner = await this.qnaService.checkIsOwner(update['check']);
      if (!checkIsOwner)
        throw new Error('Qna.getupdate에 무권한접근');

      return {
        success: true,
        status: update['status'],
        page: update['page'],
        check: update['check']
      };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna 업데이트 전 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   *qna 수정하기
   *
   *@param updateQnaDto,headers
   *@return  { success};
   */
  async updateComment(updateQnaCommentDto, headers): Promise<Object> {
    try {
      this.logger.log(updateQnaCommentDto);
      this.logger.log(headers);
      const isComment = true;
      const verified = await this.getToken.getToken(headers);
      const check = await this.qnaService.checkUserandIsSecret(
        updateQnaCommentDto.qnaCommentId, verified.userId, isComment);

      const isOwner = await this.qnaService.checkIsOwner(check['check']);

      if (!isOwner)
        throw new Error('Qna.Commentupdate 에 무권한접근');

      const res = await this.updateQnaComment(updateQnaCommentDto);

      return res;

    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna Comment업데이트 중 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @param updateQnaCommentDto
   * @returns {Success,status}
   */
  async updateQnaComment(updateQnaCommentDto) {
    try {
      await this.qnaCommentRepository
        .createQueryBuilder("qnaComment") // 이거 안에 딱히 상관은 없을건데
        // 테이블 명으로 바꿔주세요
        .update()
        .set(
          {
            title: updateQnaCommentDto.title,
            contents: updateQnaCommentDto.contents,
            isModified: true,
            issecret: updateQnaCommentDto.isSecret,
          },
        )
        .where('id = :id', {
          id: updateQnaCommentDto.qnaCommentId
        }) // camel 표기법 꼭 지켜주세요 QnaId입니다
        .execute();
      return { success: true, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna Comment 업데이트 중 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async deleteComment(deleteQnaCommentDto, headers): Promise<Object> {
    try {
      const isComment = true;
      const verified = await this.getToken.getToken(headers);
      const isUser = await this.qnaService.checkUserandIsSecret(
        deleteQnaCommentDto.qnaCommentId, verified.userId, isComment);
      if (!isUser['check']['isOwner'])
        throw new Error('Qna.delete Comment 에서 무권한접근');

      await this.qnaCommentRepository.createQueryBuilder('qnaComment')
        .update()
        .set(
          {
            isDeleted: true,
          },
        )
        .where('id = :id', { id: deleteQnaCommentDto.qnaCommentId })
        .execute();

      return { success: true, status: HttpStatus.NO_CONTENT };

    } catch (err) {
      this.logger.error(err);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Qna Comment 삭제 중 오류발생',
        success: false,
      },
        HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}