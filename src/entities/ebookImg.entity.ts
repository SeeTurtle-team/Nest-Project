import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EbookEntity } from './ebook.entity';

@Entity('ebookImg')
export class EbookImgEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, default: 'noUrl' })
  imgUrl: string;

  @OneToOne(() => EbookEntity)
  @JoinColumn()
  ebook: EbookEntity;
}
