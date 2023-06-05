import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { EbookEntity } from './ebook.entity';

@Entity('ebookRating')
export class EbookRatingEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  rating: number;

  @Column()
  dateTime: Date;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.ebookRatingEntities,
  )
  user: UserEntity;

  @ManyToOne(
    (type) => EbookEntity,
    (ebookEntity) => ebookEntity.ebookRatingEntities,
  )
  ebook: EbookEntity;
}
