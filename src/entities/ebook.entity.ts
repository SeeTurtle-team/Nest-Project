import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BoardCategoryEntity } from './boardCategory.entity';
import { EbookCommentEntity } from './ebookComment.entity';
import { EbookRatingEntity } from './ebookRating.entity';
import { EbookFileEntity } from './ebookFile.entity';
import { EbookStarRatingEntity } from './ebookStarRating.entity';
import { EbookSeriesEntity } from './ebookSeries.entity';

@Entity('ebook')
export class EbookEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 10000 })
  contents: string;

  @Column()
  dateTime: Date;

  @Column()
  isDeleted: boolean;

  @Column()
  isModified: boolean;

  @Column()
  adminCheck: boolean;

  @Column({ nullable: true })
  ban: boolean;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.ebookEntities)
  user: UserEntity;

  @ManyToOne(
    (type) => BoardCategoryEntity,
    (boardCategoryEntity) => boardCategoryEntity.ebookEntities,
  )
  boardCategory: BoardCategoryEntity;

  @OneToMany(
    (type) => EbookCommentEntity,
    (ebookCommentEntity) => ebookCommentEntity.ebook,
  )
  ebookCommentEntities: EbookCommentEntity[];

  @OneToMany(
    (type) => EbookRatingEntity,
    (ebookRatingEntity) => ebookRatingEntity.ebook,
  )
  ebookRatingEntities: EbookRatingEntity[];

  @OneToMany(
    (type) => EbookFileEntity,
    (ebookFileEntity) => ebookFileEntity.ebook,
  )
  ebookFileEntities: EbookFileEntity[];

  @OneToMany(
    (type) => EbookStarRatingEntity,
    (ebookStarRatingEntity) => ebookStarRatingEntity.ebook,
  )
  ebookStarRatingEntities: EbookStarRatingEntity[];

  @ManyToOne(
    (type) => EbookSeriesEntity,
    (ebookSeriesEntity) => ebookSeriesEntity.ebookEntities,
  )
  ebookSeries: EbookSeriesEntity;
}
