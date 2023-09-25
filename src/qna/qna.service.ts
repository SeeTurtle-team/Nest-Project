import {HttpCode, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {userGrade} from 'src/Common/userGrade';
import {QnaEntity} from 'src/entities/qna/qna.entity';
import {QnaCommentEntity} from 'src/entities/qna/qnacomment.entity';
import {GetSearchSql} from 'src/utils/GetSearchSql';
import {GetToken} from 'src/utils/GetToken';
import {Page} from 'src/utils/page';
import {QueryBuilder, Repository} from 'typeorm';
import {UpdateQnaDto} from './dto/qna.dto';

@Injectable()
export class QnaService {
  private readonly logger = new Logger(QnaService.name);
  constructor(
      @InjectRepository(QnaEntity) private readonly qnaRepository:
          Repository<QnaEntity>,
      @InjectRepository(QnaCommentEntity) private readonly qnaCommentEntity:
          Repository<QnaCommentEntity>,
      private readonly jwtService: JwtService,
      private readonly getToken: GetToken,
      private readonly getSearchSql: GetSearchSql,
  ) {}

  async countAll():Promise<number>
  {
      const count = await this.qnaRepository.query(
        `select count(*) from "Qna" as q where q."ban"=false and q."isDeleted"=false and`);
      return count[0]['count'];
  }
  async checkAdmin(userId:number){Promise<userGrade>
  const isAdmin = await this.qnaRepository.query(
    `select ug."userGrade" from "userGrade" as ug inner join (select "userGradeId" from "user" where id=${
        userId}) as temp on temp."userGradeId"=ug.id`);
  return isAdmin['0']['userGrade'];
}
    /**
   *qna유저확인
   *
   *@param @number qnaboarId(pk) @number userId(pk)
   *@return {success,status,page}
   */
  async checkUserandIsSecret(qnaBoardId, userId): Promise<Object> {
    try {
      const id =
          await this.qnaRepository.query(`select q."userId",q."issecret" 
            from "Qna" as q 
            where q."id"=${qnaBoardId}`);
      this.logger.log(id);
      let result = [false, false];
      if (id[0]['userId'] === userId) {
        result[0] = true;
      }
      if (id[0]['issecret'] === false) {
        result[1] = true;
      }
      if (result[0] || result[1]) {
        return {success: true, rt: result};
      } else {
        if (result[1]) {
          throw new HttpException(
              {
                status: HttpStatus.FORBIDDEN,
                error: 'Qna.usercheck중 무권한접근',
                success: false,
              },
              HttpStatus.FORBIDDEN,
          );
        } else {
          throw new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: 'Qna.usercheck에서 존재하지 않는Qna게시글에 접근',
                success: false,
              },
              HttpStatus.NOT_FOUND,
          );
        }
      }
    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 유저 체크 중 에러 발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   *qna전체조회
   *
   *@param page
   *@return {success,rtpage:Page}
   */
  async getAll(pageRequest): Promise<object> {
    try {
      const offset = pageRequest.getOffset();
      const limit = pageRequest.getLimit();
      const count=await this.countAll();
      const pg = await this.qnaRepository.query(
          `select  id, title, "dateTime" from "Qna" as q where q."ban"=false and q."isDeleted"=false order by q."id" desc offset ${
              offset} limit ${limit}`);
      const returnPage = new Page(count, pageRequest.pageSize, pg);
      return {success: true, returnPage};
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 전체조회중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   *qna 생성
   *
   *@param createQnaDto,headers
   *@return  { success};
   */
  async create(createQnaDto, headers): Promise<object> {
    try {
      const verified = await this.getToken.getToken(headers);
      const qnaData = new QnaEntity();
      qnaData.title = createQnaDto.title;
      qnaData.contents = createQnaDto.contents;
      qnaData.user = verified.userId;
      qnaData.username = verified.username;
      qnaData.dateTime = new Date();
      qnaData.isDeleted = false;
      qnaData.isModified = false;
      qnaData.issecret = createQnaDto.isSecret;
      if (!qnaData.issecret) {
        qnaData.username = verified.username;
      }
      await this.qnaRepository.save(qnaData);
      this.logger.log(qnaData);
      return {success: true};
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 생성중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   *qna 게시글 조회
   *
   *@param id,headers
   *@return  { success,Qna,check['rt'][2]{bool,bool}};
   */
  async getOne(id, headers): Promise<Object> {
    try {
      const verified = await this.getToken.getToken(headers);
      const check = await this.checkUserandIsSecret(id, verified.userId);
      const page = await this.qnaRepository.query(
          `select  id, title, "dateTime",contents from "Qna" where "id"=${
              id} and "ban"=false and "isDeleted"=false`);
      if (page.length > 0) {
        return {success: true, page, check};  // check[0]=isuserid,[1]=isnotsecret
      } else                                // ban || isDeleted
      {
        throw new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: 'Qna.getone에서 삭제된 Qna에 접근',
              success: false,
            },
            HttpStatus.NOT_FOUND)
      }
    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 조회중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   *qna 게시글 조회
   *
   *@param id,headers
   *@return  { success,Qna};
   */
  async getOnebyAdmin(id, headers): Promise<Object> {
    try {
      const verified = await this.getToken.getToken(headers);
      const isAdmin=await this.checkAdmin(verified.userId);
      if (isAdmin === userGrade.Admin) {
        const page = await this.qnaRepository.query(
            `select  id,title,"dateTime",contents from "Qna" where "id"=${
                id} and "ban"=false and "isDeleted"=false`);
        this.logger.log(page);
        return {
          success: true, page
        }
      } else {
        throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Qna.getOnebyAdmin에서 admin이 아닌 접속요청',
              success: false,
            },
            HttpStatus.FORBIDDEN,
        );
      }
    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'admin의 Qna 조회중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   *qna 수정전 정보가져오기
   *
   *@param id,headers
   *@return  { success,update['success','pg','check'],};
   */
  async getUpdate(id, headers): Promise<Object> {
    try {
      const update = await this.getOne(id, headers);
      if (update['check']['rt'][0] === true) {
        return {success: true, update};
      } else {
        throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Qna.getupdate에 무권한접근',
              success: false,
            },
            HttpStatus.FORBIDDEN,
        );
      }
    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 업데이트 전 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   *qna 수정하기
   *
   *@param updateQnaDto,headers
   *@return  { success};
   */
  async update(updateQnaDto, headers): Promise<Object> {
    try {
      const verified = await this.getToken.getToken(headers);
      const isUser =
          await this.checkUserandIsSecret(updateQnaDto.Qnaid, verified.userId);
      if (isUser['rt'][0]) {
        // const userData = await this.qnaRepository.createQueryBuilder('board')
        //                .update()
        //                .set(
        //                    {
        //                      title: updateQnaDto.title,
        //                      contents: updateQnaDto.contents,
        //                      isModified: true,
        //                      dateTime: new Date(),
        //                      issecret: updateQnaDto.issecret,
        //                    },
        //                    )
        //                .where('id = :id', {id: updateQnaDto.Qnaid})
        //                .execute();
        const userData=await this.qnaRepository.query(`update "Qna" set title=${updateQnaDto.title},contents=${updateQnaDto.contents}, isModified=true,dateTime: ${new Date()},issecret=${updateQnaDto.issecret} where id=${updateQnaDto.Qnaid}`);
        this.logger.log(userData);
        return {success: true};
      } else {
        throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Qna.update 에 무권한접근',
              success: false,
            },
            HttpStatus.FORBIDDEN,
        );
      }

    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 업데이트 중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  /**
   *qna 삭제하기
   *
   *@param deleteQnaDto,headers
   *@return  { success};
   */
  async delete(deleteQnaDto, headers): Promise<Object> {
    try {
      const verified = await this.getToken.getToken(headers);
      const isUser =await this.checkUserandIsSecret(deleteQnaDto.Qnaid, verified.userId);
      if (isUser['rt'][0]) {
        // const del = await this.qnaRepository.createQueryBuilder('board')
        //                 .update()
        //                 .set(
        //                     {
        //                       isDeleted: true,
        //                     },
        //                     )
        //                 .where('id = :id', {id: deleteQnaDto.Qnaid})
        //                 .execute();
        const deleteQna=await this.qnaRepository.query(`update "Qna" set isDeleted=true where id=${deleteQnaDto.Qnaid}`);
        this.logger.log(deleteQna);
        return {success: true};
      } else {
        throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              error: 'Qna.delete에서 무권한접근',
              success: false,
            },
            HttpStatus.FORBIDDEN,
        );
      }
    } catch (err) {
      this.logger.error(err);
      if (err.response.error) {
        throw err;
      }
      throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Qna 삭제 중 오류발생',
            success: false,
          },
          HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async createComment(id,createQnaCommentDto, headers):Promise<Object>
  {
    return {};
  }
}
