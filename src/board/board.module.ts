import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardRepository } from './repository/board.repository';
import { TypeOrmExModule } from 'src/typeorm-ex.module';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([BoardRepository])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
