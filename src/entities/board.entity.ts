import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BoardCategoryEntity } from './boardCategory.entity';
import { BoardCommentEntity } from './boardComment.entity';
import { ImgEntity } from './img.entity';
import { BoardRecommendEntity } from './boardRecommend.entity';
import { BoardNotifyEntity } from './boardNotify.entity';

@Entity('board')
export class BoardEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  contents: string;

  @Column()
  dateTime: Date;

  @Column()
  isDeleted: Boolean;

  @Column()
  isModified: Boolean;

  @Column({ type: 'boolean', nullable: false })
  ban : boolean;

  @Column()
  recommend: number;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.boardEntities)
  user: UserEntity;

  @ManyToOne(
    (type) => BoardCategoryEntity,
    (boardCategoryEntity) => boardCategoryEntity.boardEntities,
  )
  boardCategory: BoardCategoryEntity;

  @OneToMany(
    (type) => BoardCommentEntity,
    (boardCommentEntity) => boardCommentEntity.board,
  )
  boardCommentEntities: BoardCommentEntity[];

  @OneToMany((type) => ImgEntity, (imgEntity) => imgEntity.board)
  imgEntities: ImgEntity[];

  @OneToMany(
    (type) => BoardRecommendEntity,
    (boardRecommendEntity) => boardRecommendEntity.board,
  )
  boardRecommendEntities: BoardRecommendEntity[];

  @OneToMany(
    (type) => BoardNotifyEntity,
    (boardNotifyEntity) => boardNotifyEntity.board
  )
  boardNotifyEntities : BoardNotifyEntity[];
}
