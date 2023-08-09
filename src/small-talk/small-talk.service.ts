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
            
            //const verified = await this.checkToken(headers);
            const verified = await this.getToken.getToken(headers)

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
            const verified = await this.getToken.getToken(headers)

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

    async getAllList() {
        try{    
            const res = await this.smallSubjectRepository.createQueryBuilder('smallSubject')
                        .select('smallSubject.id', 'id')
                        .addSelect('smallSubject.title','title')
                        .addSelect('smallSubject.detail','detail')
                        .addSelect('smallSubject.isDeleted','isDeleted')
                        .addSelect('smallSubject.isModified','isModified')
                        .addSelect('smallSubject.imgUrl','imgUrl')
                        .addSelect('user.id','userId')
                        .addSelect('user.name','name')
                        .addSelect('user.nickname','nickname')
                        .addSelect('user.img','userImg')
                        .leftJoin("smallSubject.user",'user')
                        .getRawMany();

            return res;
        }catch(err){
            this.logger.error(err);
            throw new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  error: '스몰 톡 리스트 불러오는 중 에러 발생',
                  success: false,
                },
                500,
            );
        }
    }

   
}
