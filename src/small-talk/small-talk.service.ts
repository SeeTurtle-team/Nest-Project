import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { QueueTalk } from '../utils/Queue';
import { InjectRepository } from '@nestjs/typeorm';
import { SmallSubjectEntity } from 'src/entities/smallSubject.entity';
import { Repository } from 'typeorm';
import { SmallTalkEntity } from 'src/entities/smallTalk.entity';
import { JwtService } from '@nestjs/jwt';
import { GetToken } from 'src/utils/GetToken';
import { checkTokenId } from 'src/utils/CheckToken';
import { DeleteSmallSubDto } from './dto/deleteSmallSub.dto';

@Injectable()
export class SmallTalkService {
    //private readonly queue = new QueueTalk();
    private readonly logger = new Logger(SmallTalkService.name);

    constructor(
        private queue : QueueTalk,
        @InjectRepository(SmallSubjectEntity)
        private readonly smallSubjectRepository : Repository<SmallSubjectEntity>,
        @InjectRepository(SmallTalkEntity)
        private readonly smallTalkRepository : Repository<SmallTalkEntity>,
        private readonly jwtService : JwtService,
        private getToken : GetToken,
        
    ){}

    async checkToken(headers) {
        const token = headers.authorization.replace('Bearer ', '');

        return this.jwtService.verify(token, {
          secret: process.env.JWT_CONSTANTS,
        });
      }

    queueInsert(id:number){
        try{
            this.logger.log('add');
            this.queue.add(id);
            return {success:true};
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '큐 삽입 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }
    
    queuePop(){
        try{
            this.logger.log('pop');
            this.queue.popleft();
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '큐 데이터 추출 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

    readAll(){
        try{
            const res = this.queue.readAllQueue();
            console.log(res);
            return res;
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '큐 조회 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
       
    }

    async insertSmallTalkSub(createSmallSub,headers){
        try{
            
            const verified = await this.checkToken(headers);

            /**문제가 되는 부분은 여기인데 util 폴더에 있는
             * GetToken을 의존성 주입 시켜서 사용하려고 했습니다.
             * 그래서 헤더만 넘겨서 거기서 처리를 하면 코드 중복 사용을 막을 수 있어서요
             * 해당 코드가 같은 파일 안에 작성되어있을 때는 문제가 없는데 다른 파일로 분리만 하면
             * invaild 토큰 에러가 떠버리는 이슈가 있습니다
             */
            //const verified = await this.getToken.getToken(headers)

            const checkSubTitle = await this.checkSubTitle(createSmallSub.title);
            if(checkSubTitle[0]) return {success:false, msg:'타이틀 중복'}
            
            this.logger.debug(verified)

            const res = await this.insertSubDB(verified,createSmallSub);

            return res.success==true ? {success:true} : {success:false};
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '스몰 톡 주제 생성 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

    async insertSubDB(verified,createSmallSub){
        try{
            const smallTalkSub = new SmallSubjectEntity();

            smallTalkSub.date = new Date();
            smallTalkSub.isDeleted = false;
            smallTalkSub.isModified = false;
            smallTalkSub.title = createSmallSub.title;
            smallTalkSub.detail = createSmallSub.detail;
            smallTalkSub.user = verified.userId;

            await this.smallSubjectRepository.save(smallTalkSub);

            return {success:true};
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '스몰 톡 주제 생성 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

    async checkSubTitle(title:string){
        try{
            const res = await this.smallSubjectRepository.find({
                where:{
                    title:title
                }
            });

            return res;
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '스몰 톡 제목 체크 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

    async deleteSub(deleteData:DeleteSmallSubDto, headers) {
        try {
            const verified = await this.checkToken(headers);

            const checkUser = checkTokenId(deleteData.userId,verified.userId)

            if(!checkUser){
                await this.smallSubjectRepository
                .createQueryBuilder()
                .update()
                .set({
                    isDeleted:true,
                })
                .where('id = :id',{id:deleteData.id})
                .execute();

                return {success :true};
            }else{
                return {success:false,msg:'유저 불일치'};
            }
           
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '스몰 톡 주제 삭제 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

   
}
