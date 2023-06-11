import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BoardEntity } from './board.entity';

@Entity('boardRecommend')
export class BoardRecommendEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  check: boolean;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.boardRecommendEntities,
  )
  user: UserEntity;

  @ManyToOne(
    (type) => BoardEntity,
    (boardEntity) => boardEntity.boardRecommendEntities,
  )
  board: BoardEntity;
}
