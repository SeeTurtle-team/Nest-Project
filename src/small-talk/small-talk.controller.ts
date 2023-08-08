import { Body, Controller, Delete, Get, Logger, Param, Post, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SmallTalkService } from './small-talk.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateSmallSub } from './dto/createSmallSub.dto';
import { DeleteBoardDto } from 'src/board/dto/delete-board.dto';

@Controller('small-talk')
@ApiTags('Small Talk API')
@Public()
export class SmallTalkController {
    constructor(
        private smallTalkService : SmallTalkService,
    ){}

    private readonly logger = new Logger(SmallTalkController.name);

    @Get('/insert/:id')
    add(@Param('id') id:number){
        this.logger.log('-----GET /small-talk/insert/:id');
        this.smallTalkService.queueInsert(id); 
    }

    @Get('/pop')
    async pop(){
        this.logger.log('-----GET /small-talk/pop');
        this.smallTalkService.queuePop();
    }

    @Get('/read')
    read(){
        this.logger.log('-----GET /small-talk/read');
        const res = this.smallTalkService.readAll();
        return res;
    }

    @Post('/create')
    async createSmallTalkSub(@Body() createSmallSub : CreateSmallSub, @Headers() header){
        this.logger.log('-----POST /small-talk/create');
        return await this.smallTalkService.insertSmallTalkSub(createSmallSub,header);
    }

    @Delete('/delete')
    async deleteSmallTalkSub(@Body() deleteData:DeleteBoardDto) {
        this.logger.log('-----DELETE /small-talk/delete');

    }
    
 
}
