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

import { UpdateQnaDto } from './dto/qna.dto';
import { QnaCommentService } from './qnaComment.service';

@Injectable()
export class QnaService {
    private readonly logger = new Logger(QnaService.name);
    constructor(
        @InjectRepository(QnaEntity) private readonly qnaRepository:
            Repository<QnaEntity>,
        @InjectRepository(QnaCommentEntity) private readonly qnaCommentRepository:
            Repository<QnaCommentEntity>,
        private readonly getToken: GetToken,
    ) { }

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
            const count = await this.countAll(boarId);
            const page = await this.qnaCommentRepository.query(
                `select  id, title,username, "dateTime","issecret" from "qnaComment" as q where q."isDeleted"=false and q."ban"=false order by q."parentId" desc offset ${offset} limit ${limit}`);
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
    async countAll(boardId?: number): Promise<number> {
        try {
            // try 문으로 묶어야 err 핸들링 가능
            let st = null;
            if (boardId) {
                st = "qnaComment";
            } else {
                st = "qna";
            }
            const count = await this.qnaRepository.query(`select count(*) from "${st}" as q where q."ban"=false and q."isDeleted"=false`);
            return Number.parseInt(count[0]['count']);
        } catch (err) {
            this.logger.error(err); // 에러 로그 남겨주면 좋습니다.
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Qna countall에서 에러발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    async checkIsAdmin(userId: number): Promise<boolean> {
        try {
            const isAdmin = await this.qnaRepository.query(
                `select ug."userGrade" from "userGrade" as ug inner join (select "userGradeId" from "user" where id=${userId}) as temp on temp."userGradeId"=ug.id`);
            return isAdmin['0']['userGrade'] === userGrade.Admin ? true : false;
        } catch (err) {
            this.logger.error(err); // 에러 로그 남겨주면 좋습니다.
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'checkisAdmin에서 에러발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // try 문으로 묶어주세요
    }
    async checkQuery(Id, isComment?): Promise<Object | null> {
        try {
            let queryResult = null;
            if (isComment) {
                queryResult = await this.qnaCommentRepository.query(`
            select q."userId",q."issecret" 
            from "qnaComment" as q 
            where q."id"=${Id}`);
            } else {
                queryResult = await this.qnaRepository.query(`
            select q."userId",q."issecret" 
            from "qna" as q 
            where q."id"=${Id}`);
            }
            return queryResult ? queryResult['0'] : queryResult;
        } catch (err) {
            this.logger.log(err);
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
     *qna유저확인
     *
     *@param @number qnaboarId(pk) @number userId(pk)
     *@return {success,status,page}
     */
    async checkUserandIsSecret(qnaBoardId: number, userId: number,
        isComment?: boolean): Promise<Object> {
        try {
            const QueryResult = await this.checkQuery(qnaBoardId, isComment);
            if (QueryResult) {
                if (Object.keys(QueryResult).length === 0)
                    throw new Error('Qna.usercheck에서 존재하지 않는Qna게시글에 접근')
                let qryResultOne = QueryResult;
                let check = { isOwner: false, isNotSecret: false };

                check.isOwner = qryResultOne['userId'] === userId ? true : false;
                check.isNotSecret = qryResultOne['issecret'] ? false : true;

                if (check.isNotSecret || check.isOwner) {
                    return { success: true, check };
                } else {
                    throw new Error('Qna.usercheck중 무권한접근')
                }
            } else {
                return { success: false };
            }

        } catch (err) {
            this.logger.error(err);
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

    async getQnaPage(qnaId: number): Promise<any[] | false> {
        try {
            const page = await this.qnaRepository.query(
                `select  id, title, "dateTime",username,contents from "qna" where "id"=${qnaId} and "ban"=false and "isDeleted"=false`);
            return page.length > 0 ? page : false
        } catch (err) {
            this.logger.error(err);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'getQnaPage 에서 에러 발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async checkIsOwner(check: Object): Promise<boolean> {
        try {
            return check['isOwner'] ? true : false;
        } catch (err) {
            this.logger.error(err);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Qna checkIsOwner 에서 에러 발생',
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
            const count = await this.countAll();
            const page = await this.qnaRepository.query(
                `select  id, title, "dateTime" from "qna" as q where q."ban"=false and q."isDeleted"=false order by q."id" desc offset ${offset} limit ${limit}`);
            const returnPage = new Page(count, pageRequest.pageSize, page);
            return { success: true, returnPage };
        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
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
            qnaData.issecret = createQnaDto.issecret;
            if (!qnaData.issecret) {
                qnaData.username = verified.username;
            }
            await this.qnaRepository.save(qnaData);
            return { success: true, status: HttpStatus.OK };
        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
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
     */
    async getOne(id: number, headers: Header,
        pageRequest?: PageRequest): Promise<Object> {
        try {
            const verified = await this.getToken.getToken(headers);
            const check = await this.checkUserandIsSecret(id, verified.userId);
            let page = await this.getQnaPage(id);
            let comments = await this.getAllComment(id, pageRequest);
            if (comments['success']) {
                comments = comments['Page'];
            } else {
                comments = false;
            }
            if (!page) {
                throw new Error('Qna.getone에서 삭제된 Qna에 접근')
            }
            return {
                success: true,
                page,
                comments,
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
    /**
     *qna 게시글 조회
     *
     *@param id,headers
     *@return  { success,Qna};
     */
    async getOnebyAdmin(id, headers): Promise<Object> {
        try {
            const verified = await this.getToken.getToken(headers);
            const isAdmin = await this.checkIsAdmin(verified.userId);

            if (!isAdmin) {
                throw new Error('Qna.getOnebyAdmin에서 admin이 아닌 접속요청');
            }

            const page = await this.getQnaPage(id);
            return { success: true, page: page, status: HttpStatus.OK }

        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
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
     */
    async getUpdate(id, headers): Promise<Object> {
        try {
            const update = await this.getOne(id, headers);
            const checkIsOwner = await this.checkIsOwner(update['check']);
            this.logger.log(update);
            this.logger.log(checkIsOwner);

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
    async update(updateQnaDto, headers): Promise<Object> {
        try {
            const verified = await this.getToken.getToken(headers);
            const check =
                await this.checkUserandIsSecret(updateQnaDto.qnaId, verified.userId);
            let isOwner = null;
            if (check) {
                isOwner = await this.checkIsOwner(check['check']);
            } else {
                return null;
            }
            if (!isOwner)
                throw new Error('Qna.update 에 무권한접근');

            const res = await this.updateQna(updateQnaDto);

            return res;

        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Qna 업데이트 중 오류발생',
                success: false,
            },
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param updateQnaDto
     * @returns {Success,status}
     */
    async updateQna(updateQnaDto): Promise<Object> {
        try {
            await this.qnaRepository
                .createQueryBuilder(
                    "qna") // 이거 안에 딱히 상관은 없을건데 테이블 명으로 바꿔주세요
                .update()
                .set(
                    {
                        title: updateQnaDto.title,
                        contents: updateQnaDto.contents,
                        isModified: true,
                        issecret: updateQnaDto.isSecret,
                    },
                )
                .where('id = :id', {
                    id: updateQnaDto.qnaId
                }) // camel 표기법 꼭 지켜주세요 QnaId입니다
                .execute();
            return { success: true, status: HttpStatus.OK };
        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
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
            const isUser =
                await this.checkUserandIsSecret(deleteQnaDto.qnaId, verified.userId);
            if (!isUser['check']['isOwner'])
                throw new Error('Qna.delete에서 무권한접근');
            await this.qnaCommentRepository.createQueryBuilder('qnaComment')
                .update()
                .set(
                    {
                        isDeleted: true,
                    },
                )
                .where('"qnaId" = :id', { id: deleteQnaDto.qnaId })
                .execute();
            await this.qnaRepository
                .createQueryBuilder('qna') // board??
                .update()
                .set(
                    {
                        isDeleted: true,
                    },
                )
                .where('id = :id', { id: deleteQnaDto.qnaId })
                .execute();

            return { success: true, status: HttpStatus.NO_CONTENT };

        } catch (err) {
            this.logger.error(err);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'Qna 삭제 중 오류발생',
                success: false,
            },
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}