import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoardEntity } from './board.entity';
import { UserEntity } from './user.entity';

@Entity('boardNotify')
export class BoardNotifyEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 1000 })
  reason: string;

  @Column()
  dateTime: Date;

  @Column()
  IsChecked: boolean;

  @Column()
  IsDeleted: boolean;

  @ManyToOne(
    (type) => BoardEntity,
    (boardEntity) => boardEntity.boardNotifyEntities,
  )
  board: BoardEntity;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.boardNotifyEntities,
  )
  user: UserEntity;
}
