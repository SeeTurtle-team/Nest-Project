import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Logger,
    Param,
    Post,
    Patch,
    Query,
  } from '@nestjs/common';
  import { ApiOperation, ApiTags } from '@nestjs/swagger';
  import { QnaService } from './qna.service';
  import { CreateQnaDto,DeleteQnaDto,UpdateQnaDto } from './dto/qna.dto';
import { UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { PageRequest } from 'src/utils/PageRequest';
import { Public } from 'src/auth/decorators/public.decorator';


@Controller('Qna')
  @ApiTags('Qna API')
  export class QnaController {
    constructor(private QnaService: QnaService) {}
    private readonly logger = new Logger(QnaController.name);
    @Public()
    @ApiOperation({ summary: 'Qna 전체 조회' })
    @UseGuards(ThrottlerModule)
    @Throttle(10, 60)
    @Get()
    async getAll(@Query() page: PageRequest,@Headers() headers) 
    {
      this.logger.log('-----GET /Qna');
      return await this.QnaService.getAll(page);
    }
  
    @ApiOperation({ summary: 'Qna 열람' })
    @Post('/one/:id')
    async getOne(@Param('id') id: number,@Headers() headers) {
      this.logger.log('-----GET /Qna/:id');
      return await this.QnaService.getOne(id,headers);
    }
  
    @ApiOperation({ summary: 'Qna 작성' })
    @Post('/create')
    async create(@Body() createQnaDto: CreateQnaDto, @Headers() headers) {
      this.logger.log('-----POST /Qna');
      return await this.QnaService.create(createQnaDto, headers);
    }
    @ApiOperation({ summary: 'Qna 수정 전 가져오기' })
    @Post('/getupdate/:id')
    async getUpdate(@Param('id') id: number, @Headers() headers) {
      this.logger.log('-----GET /Qna/getupdate');
      return await this.QnaService.getUpdate(id, headers);
    }
  
    @ApiOperation({ summary: 'Qna 수정' })
    @Patch()
    async update(@Body() updateQnaDto: UpdateQnaDto, @Headers() headers) {
      this.logger.log('-----PATCH /Qna');
      return await this.QnaService.update(updateQnaDto, headers);
    }
  
    @ApiOperation({ summary: 'Qna 삭제' })
    @Delete()
    async delete(@Body() deleteQnaDto: DeleteQnaDto, @Headers() headers) {
      this.logger.log('-----DELETE /Qna');
      return await this.QnaService.delete(deleteQnaDto, headers);
    }
  }
  