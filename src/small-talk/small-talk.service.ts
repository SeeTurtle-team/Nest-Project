import { Injectable, Logger } from '@nestjs/common';
import { QueueTalk } from '../utils/Queue';

@Injectable()
export class SmallTalkService {
    //private readonly queue = new QueueTalk();
    private readonly logger = new Logger(SmallTalkService.name);

    constructor(
        private queue : QueueTalk
    ){

    }

    queueInsert(id:number){
        try{
            this.logger.log('add');
            this.queue.add(id);
        }catch(err){
            this.logger.error(err);
        }
    }
    
    queuePop(){
        try{
            this.logger.log('pop');
            this.queue.popleft();
        }catch(err){
            this.logger.error(err);
        }
    }

    readAll(){
        try{
            const res = this.queue.readAllQueue();
            console.log(res);
            return res;
        }catch(err){
            this.logger.error(err);
        }
       
    }

   
}
