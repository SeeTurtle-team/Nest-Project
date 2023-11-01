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
        @InjectRepository(QnaCommentEntity) private readonly qnaCommentRepository:
            Repository<QnaCommentEntity>,
        private readonly jwtService: JwtService,
        private readonly getToken: GetToken,
        private readonly getSearchSql: GetSearchSql,
    ) { 

    }

    async countAll(): Promise<number> {
        try {
            //try 문으로 묶어야 err 핸들링 가능
            let st="Qna";
            const count = await this.qnaRepository.query(
                `select count(*) from "${st}" as q where q."ban"=false and q."isDeleted"=false`);
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
    async checkQueryResult(Id,BoardId?:Symbol):Promise<any|null>
    {
        try{let queryResult=null;
        if(BoardId===undefined||BoardId===Object.getOwnPropertySymbols(this.qnaRepository)[0]){
        queryResult=await this.qnaRepository.query(`
        select q."userId",q."issecret" 
        from "Qna" as q 
        where q."id"=${Id}`);}
        else if(BoardId===Object.getOwnPropertySymbols(this.qnaCommentRepository)[0])
        {
            queryResult=await this.qnaCommentRepository.query(`
        select q."userId",q."issecret" 
        from "QnaComment" as q 
        where q."id"=${Id}`);
        }
        return queryResult;}catch(err)
        {
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
    async checkUserandIsSecret(qnaBoardId, userId,RepositorySymbol?): Promise<Object> {
        try {
            let QueryResult=null;
            if(RepositorySymbol) 
            {
                QueryResult =
                await this.checkQueryResult(qnaBoardId,RepositorySymbol);
            }
            else{
            QueryResult =
                await this.checkQueryResult(qnaBoardId);
            }
            this.logger.log(QueryResult);
            if(QueryResult){
            if(QueryResult.length<=0) throw new Error('Qna.usercheck에서 존재하지 않는Qna게시글에 접근')

            let qryResultOne = QueryResult[0];
            let check = { isOwner: false, isNotSecret: false };

            check.isOwner = qryResultOne['userId'] === userId ? true : false;
            check.isNotSecret = qryResultOne[0]['issecret'] ? false : true;

            if (check.isNotSecret || check.isOwner) {
                return { success: true, check };
            } else {
                throw new Error('Qna.usercheck중 무권한접근')
            }
        }
        else
        {
            return { success: false};
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

    async getQnaPage(qnaId: number, IsAdmin?: boolean): Promise<any[] | false> {
        try {
            const page = await this.qnaRepository.query(
                `select  id, title, "dateTime",username,contents from "Qna" where "id"=${qnaId} and "ban"=false and "isDeleted"=false`);
            return page.length > 0 ? page : false
        }
        catch (err) {
            this.logger.error(err);
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
            
            if(!isAdmin) {
                throw new Error('Qna.getOnebyAdmin에서 admin이 아닌 접속요청');
            }

            const page = await this.getQnaPage(id);
            return {
                success: true, page: page, status: HttpStatus.OK
            }

        } catch (err) {
            this.logger.error(err);
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

            if(!checkIsOwner) throw new Error('Qna.getupdate에 무권한접근');

            return { success: true, status: update['status'], page: update['page'], check: update['check'] };
          
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
            
            const isOwner = await this.checkIsOwner(check['check']);

            if(!isOwner) throw new Error('Qna.update 에 무권한접근');

            const res = await this.updateQnA(updateQnaDto);

            return res;

        } catch (err) {
            this.logger.error(err);
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
     * @param updateQnaDto
     * @returns {Success,status}
     */
    async updateQnA(updateQnaDto){
        try{
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
            .where('id = :id', { id: updateQnaDto.QnaId }) //camel 표기법 꼭 지켜주세요 QnaId입니다
            .execute();
      
            return { success: true, status: HttpStatus.OK };
        }catch(err){
            this.logger.error(err);
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
            if(!isUser['check']['isOwner']) throw new Error('Qna.delete에서 무권한접근');
            
            await this.qnaRepository.createQueryBuilder('board') //board??
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
        qnaCommentData.Qna=id;
        qnaCommentData.parentId=createQnaCommentDto.parnetId;
        if (!qnaCommentData.issecret) {
            qnaCommentData.username = verified.username;
        }
        await this.qnaCommentRepository.save(qnaCommentData);
        return { success: true, status: HttpStatus.OK };
    } catch (err) {
        this.logger.error(err);
        throw new HttpException(
            {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'QnaComment 생성중 오류발생',
                success: false,
            },
            HttpStatus.INTERNAL_SERVER_ERROR)
    }
    // async getUpdateComment(id, headers): Promise<Object> {
    //     try {
    //         const update = await this.getOneComment(id, headers);
    //         const checkIsOwner = await this.checkIsOwner(update['check']);
    //         this.logger.log(update);
    //         this.logger.log(checkIsOwner);

    //         if(!checkIsOwner) throw new Error('Qna.getupdate에 무권한접근');

    //         return { success: true, status: update['status'], page: update['page'], check: update['check'] };
          
    //     } catch (err) {
    //         this.logger.error(err);
    //         throw new HttpException({
    //             status: HttpStatus.INTERNAL_SERVER_ERROR,
    //             error: 'Qna 업데이트 전 오류발생',
    //             success: false,
    //         },
    //         HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
    // /**
    //  *qna 수정하기
    //  *
    //  *@param updateQnaDto,headers
    //  *@return  { success};
    //  */
    // async updateComment(updateQnaCommentDto, headers): Promise<Object> {
    //     try {
    //         const verified = await this.getToken.getToken(headers);
    //         const check =
    //             await this.checkUserandIsSecret(updateQnaCommentDto.qnaId, verified.userId);
            
    //         const isOwner = await this.checkIsOwner(check['check']);

    //         if(!isOwner) throw new Error('Qna.update 에 무권한접근');

    //         const res = await this.updateQnA(updateQnaCommentDto);

    //         return res;

    //     } catch (err) {
    //         this.logger.error(err);
    //         throw new HttpException(
    //             {
    //                 status: HttpStatus.INTERNAL_SERVER_ERROR,
    //                 error: 'Qna 업데이트 중 오류발생',
    //                 success: false,
    //             },
    //             HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // /**
    //  * @param updateQnaCommentDto
    //  * @returns {Success,status}
    //  */
    // async updateQnAComment(updateQnaCommentDto){
    //     try{
    //         await this.qnaRepository.createQueryBuilder("QnaComment") //이거 안에 딱히 상관은 없을건데 테이블 명으로 바꿔주세요
    //         .update()
    //         .set(
    //             {
    //                 title: updateQnaCommentDto.title,
    //                 contents: updateQnaCommentDto.contents,
    //                 isModified: true,
    //                 issecret: updateQnaCommentDto.isSecret,
    //             },
    //         )
    //         .where('id = :id', { id: updateQnaCommentDto.QnaCommentId }) //camel 표기법 꼭 지켜주세요 QnaId입니다
    //         .execute();
      
    //         return { success: true, status: HttpStatus.OK };
    //     }catch(err){
    //         this.logger.error(err);
    //         throw new HttpException(
    //             {
    //                 status: HttpStatus.INTERNAL_SERVER_ERROR,
    //                 error: 'Qna 업데이트 중 오류발생',
    //                 success: false,
    //             },
    //             HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}