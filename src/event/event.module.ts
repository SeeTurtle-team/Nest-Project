import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { SmallTalkService } from 'src/small-talk/small-talk.service';
import { QueueTalk } from 'src/utils/Queue';
import { GetToken } from 'src/utils/GetToken';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmallSubjectEntity } from 'src/entities/smallSubject.entity';
import { SmallTalkEntity } from 'src/entities/smallTalk.entity';
import { RandomSubjectEntity } from 'src/entities/randomSubject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmallTalkEntity, SmallSubjectEntity,RandomSubjectEntity]),

  ],
  providers: [EventGateway, SmallTalkService, QueueTalk, GetToken,],
})
export class EventModule { }
