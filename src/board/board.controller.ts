import {
  Controller,
  Get,
  Logger,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardCommentService } from './boardComment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { RecommendBoardDto } from './dto/recommend-board.dto';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { InsertNotifyDto } from './dto/InsertNotify.dto';
import { BanBoardDto } from './dto/BanBoard.dto';
import { GetUpdateBoardtDto } from './dto/getupdate-board.dto';

@Controller('board')
@ApiTags('Board API')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private boardCommentService: BoardCommentService,
  ) {}
  private readonly logger = new Logger(BoardController.name);

  @ApiOperation({ summary: '게시판 전체 조회' })
  @UseGuards(ThrottlerModule)
  @Throttle(10, 60)
  @Get()
  async getAll() {
    this.logger.log('-----GET /board');
    return await this.boardService.getAll();
  }

  @ApiOperation({ summary: '게시판 작성' })
  @Post('/create')
  async create(@Body() createData: CreateBoardDto) {
    this.logger.log('-----POST /board/create');
    return await this.boardService.create(createData);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @Delete('/delete')
  async delete(@Body() deleteData: DeleteBoardDto) {
    this.logger.log('-----DELETE /board/delete');
    return await this.boardService.delete(deleteData);
  }

  @ApiOperation({ summary: '게시글 수정 전 가져오기' })
  @Post('/getupdate')
  async getUpdate(@Body() boardAndUserId: GetUpdateBoardtDto) {
    this.logger.log('-----POST /board/getupdate');
    return await this.boardService.getUpdate(boardAndUserId);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @Patch('/update')
  async update(@Body() updateData: UpdateBoardDto) {
    this.logger.log('-----PATCH /board/update');
    return await this.boardService.update(updateData);
  }

  @ApiOperation({ summary: '게시글 열람' })
  @Get('/read/:id')
  async getOne(@Param('id') id: number) {
    this.logger.log('-----GET /read/:id');
    return await this.boardService.getOne(id);
  }

  @ApiOperation({ summary: '타입 별 게시판 조회' })
  @Get('/:categoryId')
  async getTyped(@Param('categoryId') categoryId: number) {
    this.logger.log('-----GET /board/:categoryId');
    return await this.boardService.getTyped(categoryId);
  }

  @ApiOperation({ summary: '게시글 추천' })
  @Post('/recommend')
  async recommend(@Body() recommendData: RecommendBoardDto) {
    this.logger.log('-----POST /board/recommend');
    return await this.boardService.recommend(recommendData);
  }

  @ApiOperation({ summary: '댓글 열람' })
  @Get('/comment/:id')
  async getComment(@Param('id') id: number) {
    this.logger.log('-----GET /comment/:id');
    return await this.boardCommentService.getComment(id);
  }

  @ApiOperation({ summary: '댓글 작성' })
  @Post('/comment/create')
  async createComment(@Body() createCommentData: CreateCommentDto) {
    this.logger.log('-----POST /comment/create');
    return await this.boardCommentService.createComment(createCommentData);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch('/comment/update')
  async updateComment(@Body() updateCommentData: UpdateCommentDto) {
    this.logger.log('-----POST /comment/update');
    return await this.boardCommentService.updateComment(updateCommentData);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete('/comment/delete')
  async deleteComment(@Body() deleteCommentData: DeleteCommentDto) {
    this.logger.log('-----Delete /comment/delete');
    return await this.boardCommentService.deleteComment(deleteCommentData);
  }

  @ApiOperation({ summary: '신고 리스트 불러오기' })
  @Get('/notify')
  async getNotiList() {
    this.logger.log('-----Delete /comment/delete');
    return await this.boardService.getNotiList();
  }

  @ApiOperation({ summary: '신고 접수' })
  @Post('/notify')
  async insertNotify(@Body() notifyDto: InsertNotifyDto) {
    this.logger.log('-----Insert /notify');
    return await this.boardService.insertNotify(notifyDto);
  }

  @ApiOperation({ summary: '신고 확인 및 게시물 밴' })
  @Post('/notify/ban')
  async banBoard(@Body() banBoardDto: BanBoardDto) {
    this.logger.log('-----POST /notify/ban');
    return await this.boardService.banBoard(banBoardDto);
  }
}
