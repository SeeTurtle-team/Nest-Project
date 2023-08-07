import { Module } from '@nestjs/common';
import { SmallTalkController } from './small-talk.controller';
import { SmallTalkService } from './small-talk.service';
import { QueueTalk } from 'src/utils/Queue';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmallTalkEntity } from 'src/entities/smallTalk.entity';
import { SmallSubjectEntity } from 'src/entities/smallSubject.entity';

@Module({
    imports:[
        TypeOrmModule.forFeature([SmallTalkEntity,SmallSubjectEntity])
    ],
    controllers:[SmallTalkController],
    providers:[SmallTalkService,QueueTalk],
    
})
export class SmallTalkModule {}