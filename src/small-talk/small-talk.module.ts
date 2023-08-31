import { Module } from '@nestjs/common';
import { SmallTalkController } from './small-talk.controller';
import { SmallTalkService } from './small-talk.service';
import { QueueTalk } from 'src/utils/Queue';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmallTalkEntity } from 'src/entities/smallTalk.entity';
import { SmallSubjectEntity } from 'src/entities/smallSubject.entity';
import { GetToken } from 'src/utils/GetToken';
import { RandomSubjectEntity } from 'src/entities/randomSubject.entity';

@Module({
    imports:[
        TypeOrmModule.forFeature([SmallTalkEntity,SmallSubjectEntity,RandomSubjectEntity]),
        
    ],
    controllers:[SmallTalkController],
    providers:[SmallTalkService,QueueTalk,GetToken,],
    exports:[SmallTalkService]
})
export class SmallTalkModule {}
