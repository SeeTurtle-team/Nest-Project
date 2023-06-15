import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardRepository } from './repository/board.repository';
import { TypeOrmExModule } from 'src/typeorm-ex.module';
import { BoardCommentService } from './boardComment.service';
import { BoardCommentRepository } from './repository/boardComment.repository';
import { BoardEntity } from 'src/entities/board.entity';
import { BoardNotifyEntity } from 'src/entities/boardNotify.entity';
import { BoardCommentEntity } from 'src/entities/boardComment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // TypeOrmExModule.forCustomRepository([
    //   BoardRepository,
    //   BoardCommentRepository,
      
    // ]),
    TypeOrmModule.forFeature([BoardEntity,BoardNotifyEntity,BoardCommentEntity])
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardCommentService],
})
export class BoardModule {}
