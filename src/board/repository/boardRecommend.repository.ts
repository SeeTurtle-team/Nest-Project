import { BoardRecommendEntity } from 'src/entities/boardRecommend.entity';
import { CustomRepository } from 'src/typeorm-ex.decorator';
import { Repository } from 'typeorm';

@CustomRepository(BoardRecommendEntity)
export class BoardRecommendRepository extends Repository<BoardRecommendEntity> {}
