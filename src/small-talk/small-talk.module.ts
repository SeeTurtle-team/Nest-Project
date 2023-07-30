import { Module } from '@nestjs/common';
import { SmallTalkController } from './small-talk.controller';
import { SmallTalkService } from './small-talk.service';
import { QueueTalk } from 'src/utils/Queue';

@Module({
    controllers:[SmallTalkController],
    providers:[SmallTalkService,QueueTalk],
    
})
export class SmallTalkModule {}
