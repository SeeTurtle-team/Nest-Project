import { HttpCode, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { userGrade } from 'src/Common/userGrade';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import { GetSearchSql } from 'src/utils/GetSearchSql';
import { GetToken } from 'src/utils/GetToken';
import { Page } from 'src/utils/page';
import { QueryBuilder, Repository } from 'typeorm';
import { UpdateQnaDto } from './dto/qna.dto';
import { error } from 'console';

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
    ) { }

    async countAll(): Promise<number> {
        try {
            //try 문으로 묶어야 err 핸들링 가능
            const count = await this.qnaRepository.query(
                `select count(*) from "Qna" as q where q."ban"=false and q."isDeleted"=false`);
            return count[0]['count'];
        }
        catch (err) {
            // if ('response' in err) {
            //     if ('error' in err.response) {
            //         throw err;
            //     }
            // } 이 부분은 꼭 필요가 없어 지우는게 좋아보입니다.
            this.logger.error(err); //에러 로그 남겨주면 좋습니다.

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
        }
        catch (err) {
            this.logger.error(err); //에러 로그 남겨주면 좋습니다.
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Qna checkisAdmin에서 에러발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        //try 문으로 묶어주세요
    }
    /**
   *qna유저확인
   *
   *@param @number qnaboarId(pk) @number userId(pk)
   *@return {success,status,page}
   */
    async checkUserandIsSecret(qnaBoardId, userId): Promise<Object> {
        try {
            const checkQueryResult =
                await this.qnaRepository.query(`
                        select q."userId",q."issecret" 
                        from "Qna" as q 
                        where q."id"=${qnaBoardId}`
                );

            this.logger.log(checkQueryResult);

            if (checkQueryResult.length > 0) {
                let check = { isOwner: false, isNotSecret: false };

                check.isOwner = checkQueryResult[0]['userId'] === userId ? true : false;
                check.isNotSecret = checkQueryResult[0]['issecret'] ? false : true;

                if (check.isNotSecret || check.isOwner) {
                    return { success: true, check };
                } else {
                    throw new HttpException(
                        {
                            status: HttpStatus.FORBIDDEN,
                            error: 'Qna.usercheck중 무권한접근',
                            success: false,
                        },
                        HttpStatus.FORBIDDEN,
                    );
                }
            }
            else {
                throw new HttpException(
                    {
                        status: HttpStatus.NOT_FOUND,
                        error: 'Qna.usercheck에서 존재하지 않는Qna게시글에 접근',
                        success: false,
                    },
                    HttpStatus.NOT_FOUND,
                );
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

    async checkQueryResult(qnaBoardId) {
        try {
            const res = await this.qnaRepository.query(`
                    select q."userId",q."issecret" 
                    from "Qna" as q 
                    where q."id"=${qnaBoardId}`
            );

            if (res.length > 0) return res;
        } catch (err) {

        }
    }

    async getQnaPage(qnaId: number, IsAdmin?: boolean): Promise<any[] | false> {
        try {
            const page = await this.qnaRepository.query(
                `select  id, title, "dateTime",username,contents from "Qna" where "id"=${qnaId} and "ban"=false and "isDeleted"=false`);
            return page.length > 0 ? page : false
        }
        catch (err) {
            if ('response' in err) {
                if ('error' in err.response) {
                    throw err;
                }
            }
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'getQnaPage 에서 에러 발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,);
        }
    }

    async checkIsOwner(check: Object): Promise<boolean> {
        try {
            return check['isOwner'] ? true : false;
        }
        catch (err) {
            this.logger.error(err);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Qna checkIsOwner 에서 에러 발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,);

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
                `select  id, title, "dateTime" from "Qna" as q where q."ban"=false and q."isDeleted"=false order by q."id" desc offset ${offset} limit ${limit}`);
            const returnPage = new Page(count, pageRequest.pageSize, page);
            return { success: true, returnPage };
        } catch (err) {
            this.logger.error(err);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Qna 전체조회중 오류발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
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
     */
    async getOne(id, headers): Promise<Object> {
        try {
            const verified = await this.getToken.getToken(headers);
            const check = await this.checkUserandIsSecret(id, verified.userId);
            let page = await this.getQnaPage(id);

            if(!page){
               throw new Error('Qna.getone에서 삭제된 Qna에 접근')
            }
            return { success: true, page, check: check['check'], status: HttpStatus.OK };
    
            // if (page) {
            //     return { success: true, page, check: check['check'], status: HttpStatus.OK };
            // } else {
            //     throw new HttpException(
            //         {
            //             status: HttpStatus.NOT_FOUND,
            //             error: 'Qna.getone에서 삭제된 Qna에 접근',
            //             success: false,
            //         },
            //         HttpStatus.NOT_FOUND)
            // } 확인해보니 이런식으로 if 문안에 있는 에러문은 출력이
            // 되거나 에러를 프론트에서 확인할 수 없습니다. 
            //간단하게 에러 로그만 찍고 catch문에 있는 로그를 반환하도록 하는게 가독성에 좀 더 도움이 될거 같네요
        } catch (err) {
            this.logger.error(err);
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
            const isAdmin = await this.checkIsAdmin(verified.userId);
            if (isAdmin) {
                const page = await this.getQnaPage(id);
                return {
                    success: true, page: page, status: HttpStatus.OK
                } //이 부분도 함수로 따로 빼서 거기서 try catch를 하면 코드가 깔끔해질거 같습니다
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
            if ('response' in err) {
                if ('error' in err.response) {
                    throw err;
                }
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
     */
    async getUpdate(id, headers): Promise<Object> {
        try {
            const update = await this.getOne(id, headers);
            const checkIsOwner = await this.checkIsOwner(update['check']);
            this.logger.log(update);
            this.logger.log(checkIsOwner);
            if (checkIsOwner) {
                return { success: true, status: update['status'], page: update['page'], check: update['check'] };
            } else {
                throw new HttpException(
                    {
                        status: HttpStatus.FORBIDDEN,
                        error: 'Qna.getupdate에 무권한접근',
                        success: false,
                    },
                    HttpStatus.FORBIDDEN,
                );
            } //미수행//간단한 if 문은 삼항연산자로 표현
        } catch (err) {
            if ('response' in err) {
                if ('error' in err.response) {
                    throw err;
                }
            }
            throw new HttpException({
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
            const check =
                await this.checkUserandIsSecret(updateQnaDto.qnaId, verified.userId);
            const isOwner = await this.checkIsOwner(check['check']);
            if (isOwner) {
                await this.qnaRepository.createQueryBuilder("Qna") //이거 안에 딱히 상관은 없을건데 테이블 명으로 바꿔주세요
                    .update()
                    .set(
                        {
                            title: updateQnaDto.title,
                            contents: updateQnaDto.contents,
                            isModified: true,
                            issecret: updateQnaDto.isSecret,
                        },
                    )
                    .where('id = :id', { id: updateQnaDto.qnaId }) //camel 표기법 꼭 지켜주세요 QnaId입니다
                    .execute();
                // const isSecret=updateQnaDto.issecret?true:false;
                // const userData=await this.qnaRepository.query(`update "Qna" set title='${updateQnaDto.title}',contents='${updateQnaDto.contents}', "isModified"=true,"dateTime"='${new Date().toLocaleTimeString()}',issecret=${isSecret} where id=${updateQnaDto.Qnaid}`);
                // this.logger.log(userData);
                return { success: true, status: HttpStatus.OK };
            } else {
                throw new HttpException(
                    {
                        status: HttpStatus.FORBIDDEN,
                        error: 'Qna.update 에 무권한접근',
                        success: false,
                    },
                    HttpStatus.FORBIDDEN,
                );
            } //미수행//이 if 문도 따로 함수로 빼면 좋을거 같습니다.

        } catch (err) {
            this.logger.error(err);
            if ('response' in err) {
                if ('error' in err.response) {
                    throw err;
                }
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
            const isUser = await this.checkUserandIsSecret(deleteQnaDto.qnaId, verified.userId);
            if (isUser['check']['isOwner']) {
                const deleteQna = await this.qnaRepository.createQueryBuilder('board')
                    .update()
                    .set(
                        {
                            isDeleted: true,
                        },
                    )
                    .where('id = :id', { id: deleteQnaDto.qnaId })
                    .execute();
                // const deleteQna=await this.qnaRepository.query(`update "Qna" set isDeleted=true where id=${deleteQnaDto.Qnaid}`);
                // this.logger.log(deleteQna);
                return { success: true, status: HttpStatus.NO_CONTENT };
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
            if ('response' in err) {
                if ('error' in err.response) {
                    throw err;
                }
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
    async createComment(id, createQnaCommentDto, headers): Promise<Object> {
        return {};
    }
}