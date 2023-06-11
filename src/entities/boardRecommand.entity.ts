import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BoardEntity } from './board.entity';

@Entity('boardRecommand')
export class BoardRecommandEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  check: boolean;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.boardRecommandEntities,
  )
  user: UserEntity;

  @ManyToOne(
    (type) => BoardEntity,
    (boardEntity) => boardEntity.boardRecommandEntities,
  )
  board: BoardEntity;
}
