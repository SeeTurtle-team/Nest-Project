import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { EbookEntity } from './ebook.entity';

@Entity('ebookStarRating')
export class EbookStarRatingEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  starRate: number;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.ebookStarRatingEntities,
  )
  user: UserEntity;

  @ManyToOne(
    (type) => EbookEntity,
    (ebookEntity) => ebookEntity.ebookStarRatingEntities,
  )
  ebook: EbookEntity;
}
