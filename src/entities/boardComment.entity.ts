import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BoardEntity } from './board.entity';

@Entity('boardComment')
export class BoardCommentEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 1000 })
  contents: string;

  @Column()
  dateTime: Date;

  @Column()
  isDeleted: boolean;

  @Column()
  isModified: boolean;

  @ManyToOne(
    (type) => BoardEntity,
    (boardEntity) => boardEntity.boardCommentEntities,
  )
  board: BoardEntity;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.boardCommentEntities,
  )
  user: UserEntity;
}
