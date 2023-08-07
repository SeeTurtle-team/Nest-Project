import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { QueueTalk } from '../utils/Queue';
import { InjectRepository } from '@nestjs/typeorm';
import { SmallSubjectEntity } from 'src/entities/smallSubject.entity';
import { Repository } from 'typeorm';
import { SmallTalkEntity } from 'src/entities/smallTalk.entity';

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
    ){}

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

    async insertSmallTalkSub(createSmallSub){
        try{
            const smallTalkSub = new SmallSubjectEntity();

            smallTalkSub.date = new Date();
            smallTalkSub.isDeleted = false;
            smallTalkSub.isModified = false;
            smallTalkSub.title = createSmallSub.title;
            smallTalkSub.detail = createSmallSub.detail;

            await this.smallSubjectRepository.save(smallTalkSub);

            return {success:false};
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

   
}
