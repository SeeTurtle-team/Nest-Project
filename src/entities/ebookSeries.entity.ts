import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { EbookEntity } from './ebook.entity';

@Entity('ebookSeries')
export class EbookSeriesEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  seriesName: string;

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => userEntity.ebookSeriesEntities,
  )
  user: UserEntity;

  @Column({ nullable: true })
  isDeleted: boolean;

  @OneToMany((type) => EbookEntity, (ebookEntity) => ebookEntity.ebookSeries)
  ebookEntities: EbookEntity[];
}
