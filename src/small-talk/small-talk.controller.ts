import { Body, Controller, Delete, Get, Logger, Param, Post, Headers, Patch, Head } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SmallTalkService } from './small-talk.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateSmallSub } from './dto/createSmallSub.dto';
import { DeleteSmallSubDto } from './dto/deleteSmallSub.dto';
import { InsertSmallTalkDto } from './dto/insertSmallTalk.dto';

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
    
    @ApiOperation({ summary: '큐 데이터 전부 가져오기' })
    @Get('/read')
    read(){
        this.logger.log('-----GET /small-talk/read');
        const res = this.smallTalkService.readAll();
        return res;
    }

    @ApiOperation({ summary: '스몰 톡 주제 생성' })
    @Post('/create')
    async createSmallTalkSub(@Body() createSmallSub : CreateSmallSub, @Headers() header){
        this.logger.log('-----POST /small-talk/create');
        return await this.smallTalkService.insertSmallTalkSub(createSmallSub,header);
    }

    @ApiOperation({ summary: '스몰 톡 주제 삭제' })
    @Post('/delete')
    async deleteSmallTalkSub(@Body() deleteData:DeleteSmallSubDto, @Headers() header) {
        this.logger.log('-----DELETE /small-talk/delete');
        return await this.smallTalkService.deleteSub(deleteData, header);
    }

    @ApiOperation({ summary: '스몰 톡 주제 삭제' })
    @Get('/getAllList')
    async getAllList() {
        this.logger.log('-----GET /small-talk/getAllList');
        return await this.smallTalkService.getAllList();
    }

    @ApiOperation({ summary: '스몰 톡 내용 가져오기'})
    @Get('/getSmallTalk/:id')
    async getSmallTalkList(@Param('id') id :number) {
        this.logger.log('-----GET /small-talk/getSmallList/:id');
        return await this.smallTalkService.getSmallTalkList(id);
    }
    
    @ApiOperation({ summary: '스몰 톡 내용 입력하기'})
    @Patch('/insertSmallTalk')
    async insertSmallTalk(@Body() insertSmallTalk: InsertSmallTalkDto ,@Headers() headers){
        this.logger.log('-----PATCH /small-talk/insertSmallTalk');
        return await this.smallTalkService.insertSmallTalk(insertSmallTalk, headers);

    }

    @Get('/test/:id')
    async test(@Param('id') id:number){
        return await this.smallTalkService.getSmallTalkSubOne(id);
    }
    
 
}
