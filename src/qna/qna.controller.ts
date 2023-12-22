import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {Throttle, ThrottlerModule} from '@nestjs/throttler';
import {Public} from 'src/auth/decorators/public.decorator';
import {PageRequest} from 'src/utils/PageRequest';

import {CreateQnaDto, DeleteQnaDto, UpdateQnaDto} from './dto/qna.dto';
import {
  CreateQnaCommentDto,
  DeleteQnaCommentDto,
  UpdateQnaCommentDto
} from './dto/qnacomment.dto';
import {QnaService} from './qna.service';
import { QnaCommentService } from './qnaComment.service';
@Controller('qna')
@ApiTags('Qna API')
export class QnaController {
  constructor(private qnaService: QnaService,private qnaCommentService:QnaCommentService) {}
  private readonly logger = new Logger(QnaController.name);
  @Public()
  @ApiOperation({summary : 'Qna 전체 조회'})
  @UseGuards(ThrottlerModule)
  @Throttle(10, 60)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAll(@Query() page: PageRequest, @Headers() headers) {
    this.logger.log('-----GET /Qna');
    return await this.qnaService.getAll(page);
  }

  @ApiOperation({summary : 'Qna 열람'})
  @HttpCode(HttpStatus.OK)
  @Get('/one/:id')
  async getOne(
      @Param('id') id: number,
      @Headers() headers,
      @Query() page: PageRequest,
  ) {
    this.logger.log('-----GET /Qna/:id');
    if (page) {
      return await this.qnaService.getOne(id, headers, page);
    } else {
      return await this.qnaService.getOne(id, headers);
    }
  }
  @ApiOperation({summary : 'Admin의 Qna 열람'})
  @HttpCode(HttpStatus.OK)
  @Get('/oneByAdmin/:id')
  async getOnebyAdmin(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----Post /Qna/:id');
    return await this.qnaService.getOnebyAdmin(id, headers);
  }

  @ApiOperation({summary : 'Qna 작성'})
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  async create(@Body() createQnaDto: CreateQnaDto, @Headers() headers) {
    this.logger.log('-----POST /Qna');
    return await this.qnaService.create(createQnaDto, headers);
  }
  @ApiOperation({summary : 'Qna 수정 전 가져오기'})
  @HttpCode(HttpStatus.OK)
  @Get('/getupdate/:id')
  async getUpdate(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----GET /Qna/getupdate');
    return await this.qnaService.getUpdate(id, headers);
  }

  @ApiOperation({summary : 'Qna 수정'})
  @HttpCode(HttpStatus.OK)
  @Patch()
  async update(@Body() updateQnaDto: UpdateQnaDto, @Headers() headers) {
    this.logger.log('-----PATCH /Qna');
    return await this.qnaService.update(updateQnaDto, headers);
  }

  @ApiOperation({summary : 'Qna 삭제'})
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  async delete(@Body() deleteQnaDto: DeleteQnaDto, @Headers() headers) {
    this.logger.log('-----DELETE /Qna');
    return await this.qnaService.delete(deleteQnaDto, headers);
  }

  @ApiOperation({summary : 'Qna comment 작성'})
  @HttpCode(HttpStatus.CREATED)
  @Post('/comment/create/')
  async createComment(@Param('id') id: number,
                      @Body() createQnaCommentDto: CreateQnaCommentDto,
                      @Headers() headers) {
    this.logger.log('-----Post /Qna/comment/create');
    return await this.qnaCommentService.createComment(id, createQnaCommentDto,
                                               headers);
  }

  @ApiOperation({summary : 'Qna  Comment 수정 전 가져오기'})
  @HttpCode(HttpStatus.OK)
  @Get('/getCommentUpdate/:commentId')
  async getCommentUpdate(@Param('commentId') commentId: number,
                         @Headers() headers) {
    this.logger.log('-----GET /Qna/getCommentupdate');
    return await this.qnaCommentService.getCommentUpdate(commentId, headers);
  }

  @ApiOperation({summary : 'Qna Comment 수정'})
  @HttpCode(HttpStatus.OK)
  @Patch('/comment')
  async updateComment(@Body() updateQnaCommentDto: UpdateQnaCommentDto,
                      @Headers() headers) {
    this.logger.log('-----PATCH /Qna/Comment');
    return await this.qnaCommentService.updateComment(updateQnaCommentDto, headers);
  }

  @ApiOperation({summary : 'Qna Comment 열람'})
  @HttpCode(HttpStatus.OK)
  @Get('/comment/:id')
  async getOneComment(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----GET /Qna/Comment/:id')
    return await this.qnaCommentService.getOneComment(id, headers);
  }
  
  @ApiOperation({summary : 'Qna Comment 삭제'})
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/comment')
  async deleteComment(@Body() deleteQnaCommentDto: DeleteQnaCommentDto,
                      @Headers() headers) {
    this.logger.log('-----DELETE /Qna/Comment ');
    return await this.qnaCommentService.deleteComment(deleteQnaCommentDto, headers);
  }
}
