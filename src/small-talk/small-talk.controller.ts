import { Body, Controller, Delete, Get, Logger, Param, Post, Headers, Patch, Head } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SmallTalkService } from './small-talk.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateSmallSub } from './dto/createSmallSub.dto';
import { DeleteSmallSubDto } from './dto/deleteSmallSub.dto';
import { InsertSmallTalkDto } from './dto/insertSmallTalk.dto';
import { SearchSmallSubTitle } from './dto/searchSmallSubTitle.dto';

@Controller('small-talk')
@ApiTags('Small Talk API')
export class SmallTalkController {
    constructor(
        private smallTalkService : SmallTalkService,
    ){}

    private readonly logger = new Logger(SmallTalkController.name);

    @ApiOperation({ summary: '큐 데이터 삽입' })
    @Get('/insert/:id')
    add(@Param('id') id:number){
        this.logger.log('-----GET /small-talk/insert/:id');
        this.smallTalkService.queueInsert(id); 
    }

    @ApiOperation({ summary: '큐 데이터 가져오기' })
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

    @ApiOperation({ summary: '스몰 톡 주제 리스트 가져오기' })
    @Get('/getAllList')
    async getAllList() {
        this.logger.log('-----GET /small-talk/getAllList');
        return await this.smallTalkService.getAllList();
    }

    @ApiOperation({ summary: '스몰 톡 채팅 리스트 조회'})
    @Get('/getSmallTalk/:id')
    async getSmallTalkList(@Param('id') id :number) {
        this.logger.log('-----GET /small-talk/getSmallList/:id');
        return await this.smallTalkService.getSmallOne(id);
    }
    
    @ApiOperation({ summary: '스몰 톡 내용 입력하기'})
    @Patch('/insertSmallTalk')
    async insertSmallTalk(@Body() insertSmallTalk: InsertSmallTalkDto ,@Headers() headers){
        this.logger.log('-----PATCH /small-talk/insertSmallTalk');
        return await this.smallTalkService.insertSmallTalk(insertSmallTalk, headers);

    }

    @ApiOperation({ summary: '해당 스몰 톡 주제 가져오기'})
    @Get('/getOneSub/:id')
    async getSmallTalkSubOne(@Param('id') id:number){
        this.logger.log('-----GET /small-talk/getOneSub/:id');
        return await this.smallTalkService.getSmallTalkSubOne(id);
    }
    
    @ApiOperation({ summary: '스몰 톡 주제 제목 검색'})
    @Post('/searchTitle')
    async searchSmallTalkSubTitle(@Body() searchSmallSubTitle : SearchSmallSubTitle){
        this.logger.log('-----POST /small-talk/searchTitle');
        return await this.smallTalkService.getAllList(searchSmallSubTitle.title);

    }

    @ApiOperation({ summary: '랜덤 톡 주제 랜덤으로 가져오기' })
    @Get('/getRandomSub')
    async getRandomSub() {
        this.logger.log('-----GET /small-talk/getRandomSub');
        return await this.smallTalkService.getRandomSub();
    }

    @ApiOperation({ summary: '랜덤 톡 큐 삽입' })
    @Get('/insertQueue')
    async randomQueueAdd(@Headers() headers) {
        this.logger.log('-----GET /small-talk/insertQueue');
        return await this.smallTalkService.randomQueueAdd(headers);
    }

 
}
