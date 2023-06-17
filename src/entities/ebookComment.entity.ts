import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EbookEntity } from './ebook.entity';
import { UserEntity } from './user.entity';

@Entity('ebookComment')
export class EbookCommentEntity {
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
    (type) => EbookEntity,
    (ebookEntity) => ebookEntity.ebookCommentEntities,
  )
  ebook: EbookEntity;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.ebookCommentEntities,
  )
  user: UserEntity;
}
