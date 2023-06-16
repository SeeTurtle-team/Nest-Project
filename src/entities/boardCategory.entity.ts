import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BoardEntity } from './board.entity';
import { EbookEntity } from './ebook.entity';

@Entity('boardCategory')
export class BoardCategoryEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({length:10})
  category: string;

  @OneToMany((type) => BoardEntity, (boardEntity) => boardEntity.boardCategory)
  boardEntities: BoardEntity[];

  @OneToMany((type) => EbookEntity, (ebookEntity) => ebookEntity.boardCategory)
  ebookEntities: EbookEntity[];
}
