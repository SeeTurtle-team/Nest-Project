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

  @Column()
  recommand: number;

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
}
