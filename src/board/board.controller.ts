import {
  Controller,
  Get,
  Logger,
  Post,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { DeleteBoardDto } from './dto/delete-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('board')
@ApiTags('Board API')
export class BoardController {
  constructor(private boardService: BoardService) {}
  private readonly logger = new Logger(BoardController.name);

  @ApiOperation({ summary: '게시판 전체 조회' })
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

  @ApiOperation({ summary: '게시글 수정' })
  @Patch('/update')
  async update(@Body() updateData: UpdateBoardDto) {
    this.logger.log('-----PATCH /board/update');
    return await this.boardService.update(updateData);
  }
}
