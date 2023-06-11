import { BoardCommentEntity } from 'src/entities/boardComment.entity';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(BoardCommentEntity)
export class BoardCommentRepository extends Repository<BoardCommentEntity> {}
