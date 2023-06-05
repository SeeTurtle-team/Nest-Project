import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SmallTalkEntity } from './smallTalk.entity';

@Entity('smallSubject')
export class SmallSubjectEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column()
  detail: string;

  @Column()
  date: number;

  @Column()
  isDeleted: Boolean;

  @Column()
  isModified: Boolean;

  @OneToMany(
    (type) => SmallTalkEntity,
    (smallTalkEntity) => smallTalkEntity.smallSubject,
  )
  smallTalkEntities: SmallTalkEntity[];
}
