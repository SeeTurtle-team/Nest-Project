import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardRepository } from './repository/board.repository';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
import { BoardCommentService } from './boardComment.service';
import { BoardCommentRepository } from './repository/boardComment.repository';

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      BoardRepository,
      BoardCommentRepository,
    ]),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardCommentService],
})
export class BoardModule {}
