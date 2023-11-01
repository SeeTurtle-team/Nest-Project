import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { EbookEntity } from './ebook.entity';

@Entity('ebookHistory')
export class EbookHistoryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  dateTime: Date;

  @Column()
  isDeleted: boolean;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.ebookHistoryEntities,
  )
  user: UserEntity;

  @ManyToOne(
    (type) => EbookEntity,
    (ebookEntity) => ebookEntity.ebookHistoryEntities,
  )
  ebook: EbookEntity;
}
