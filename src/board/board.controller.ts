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
  Headers,
  UseInterceptors,
  Query,
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
import { TimeoutHandler } from 'src/auth/decorators/timeout-decorator';
import { MethodTimeMeterInterceptor } from 'src/Interceptor/MethodTimeMeter.interceptor';
import { PageRequest } from 'src/utils/PageRequest';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('board')
@ApiTags('Board API')
//@UseInterceptors(MethodTimeMeterInterceptor)
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
  async getAll(@Query() page: PageRequest) {
    this.logger.log('-----GET /board');
    return await this.boardService.getAll(page);
  }

  @ApiOperation({ summary: '게시판 전체 개수 조회' })
  @Get('/count')
  async getTotalCount() {
    this.logger.log('-----GET /board/count');
    return await this.boardService.getTotalCount();
  }

  @ApiOperation({ summary: '게시판 작성' })
  @Post('/create')
  async create(@Body() createData: CreateBoardDto, @Headers() headers) {
    this.logger.log('-----POST /board/create');
    return await this.boardService.create(createData, headers);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @Delete('/delete')
  async delete(@Body() deleteData: DeleteBoardDto, @Headers() headers) {
    this.logger.log('-----DELETE /board/delete');
    return await this.boardService.delete(deleteData, headers);
  }

  @ApiOperation({ summary: '게시글 수정 전 가져오기' })
  @Get('/getupdate/:id')
  async getUpdate(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----POST /board/getupdate');
    return await this.boardService.getUpdate(id, headers);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @Patch('/update')
  async update(@Body() updateData: UpdateBoardDto, @Headers() headers) {
    this.logger.log('-----PATCH /board/update');
    return await this.boardService.update(updateData, headers);
  }

  @ApiOperation({ summary: '게시글 열람' })
  @Get('/read/:id')
  async getOne(@Param('id') id: number) {
    this.logger.log('-----GET /read/:id');
    return await this.boardService.getOne(id);
  }

  @ApiOperation({ summary: '타입 별 게시판 조회' })
  @Get('/categoryList/:id')
  async getTyped(
    @Param('id') boardCategoryId: number,
    @Query() page: PageRequest,
  ) {
    this.logger.log('-----GET /board');
    return await this.boardService.getTyped(boardCategoryId, page);
  }

  @ApiOperation({ summary: '게시글 추천' })
  @Post('/recommend')
  async recommend(
    @Body() recommendData: RecommendBoardDto,
    @Headers() headers,
  ) {
    this.logger.log('-----POST /board/recommend');
    return await this.boardService.recommend(recommendData, headers);
  }

  @ApiOperation({ summary: '댓글 열람' })
  @Get('/comment/:id')
  async getComment(@Param('id') id: number) {
    this.logger.log('-----GET /comment/:id');
    return await this.boardCommentService.getComment(id);
  }

  @ApiOperation({ summary: '댓글 작성' })
  @Post('/comment/create')
  async createComment(
    @Body() createCommentData: CreateCommentDto,
    @Headers() headers,
  ) {
    this.logger.log('-----POST /comment/create');
    return await this.boardCommentService.createComment(
      createCommentData,
      headers,
    );
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch('/comment/update')
  async updateComment(
    @Body() updateCommentData: UpdateCommentDto,
    @Headers() headers,
  ) {
    this.logger.log('-----POST /comment/update');
    return await this.boardCommentService.updateComment(
      updateCommentData,
      headers,
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete('/comment/delete')
  async deleteComment(
    @Body() deleteCommentData: DeleteCommentDto,
    @Headers() headers,
  ) {
    this.logger.log('-----Delete /comment/delete');
    return await this.boardCommentService.deleteComment(
      deleteCommentData,
      headers,
    );
  }

  @ApiOperation({ summary: '신고 리스트 불러오기' })
  @Get('/notify')
  async getNotiList() {
    this.logger.log('-----Delete /comment/delete');
    return await this.boardService.getNotiList();
  }

  @ApiOperation({ summary: '신고 접수' })
  @Post('/notify')
  async insertNotify(@Body() notifyDto: InsertNotifyDto, @Headers() headers) {
    this.logger.log('-----Insert /notify');
    return await this.boardService.insertNotify(notifyDto, headers);
  }

  @ApiOperation({ summary: '신고 확인 및 게시물 밴' })
  @Post('/notify/ban')
  async banBoard(@Body() banBoardDto: BanBoardDto) {
    this.logger.log('-----POST /notify/ban');
    return await this.boardService.banBoard(banBoardDto);
  }

  @ApiOperation({ summary: '카테고리 조회' })
  @Get('/category')
  async getCategoryList() {
    this.logger.log('-----GET /category');
    return await this.boardService.getCategoryList();
  }

  @ApiOperation({ summary: 'Get S3 presigned url' })
  @Get('/s3url')
  async s3url() {
    this.logger.log('-----GET /s3url');
    return await this.boardService.s3url();
  }

  @ApiOperation({ summary: '검색 기능: 제목 + 내용' })
  @Get('/searchAll')
  async searchAll(@Query() page: PageRequest) {
    this.logger.log('----GET /searchAll');
    return await this.boardService.searchAll(page);
  }

  @ApiOperation({ summary: '검색 기능: 제목' })
  @Get('/searchTitle')
  async searchTitle(@Query() page: PageRequest) {
    this.logger.log('----GET /searchTitle');
    return await this.boardService.searchTitle(page);
  }

  @ApiOperation({ summary: '검색 기능: 내용' })
  @Get('/searchContent')
  async searchContent(@Query() page: PageRequest) {
    this.logger.log('----GET /searchContent');
    return await this.boardService.searchContent(page);
  }

  @Public()
  @ApiOperation({ summary: '최근 업로드 된 게시글 불러오기' })
  @Get('/lastBoard')
  async lastBoard() {
    this.logger.log('----GET /lastBoard');
    return await this.boardService.lastBoard();
  }

  @ApiOperation({ summary: '내 게시판 불러오기' })
  @Get('/myBoard')
  async test(@Query() page: PageRequest, @Headers() headers) {
    this.logger.log('-----GET /myBoard');
    return await this.boardService.getMyBoard(page, headers);
  }
}
