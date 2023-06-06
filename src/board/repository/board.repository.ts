import { BoardEntity } from 'src/entities/board.entity';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(BoardEntity)
export class BoardRepository extends Repository<BoardEntity> {}
