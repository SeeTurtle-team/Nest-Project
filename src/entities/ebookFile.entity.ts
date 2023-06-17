import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EbookEntity } from './ebook.entity';

@Entity('ebookFile')
export class EbookFileEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 1000 })
  fileUrl: string;

  @ManyToOne(
    (type) => EbookEntity,
    (ebookEntity) => ebookEntity.ebookFileEntities,
  )
  ebook: EbookEntity;
}
