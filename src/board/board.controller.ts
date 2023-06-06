import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardService } from './board.service';

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
}
