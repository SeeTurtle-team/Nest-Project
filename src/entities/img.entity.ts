import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoardEntity } from './board.entity';

@Entity('img')
export class ImgEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 1000 })
  imgUrl: string;

  @ManyToOne((type) => BoardEntity, (boardEntity) => boardEntity.id)
  board: BoardEntity;
}
