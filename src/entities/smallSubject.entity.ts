import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SmallTalkEntity } from './smallTalk.entity';

@Entity('smallSubject')
export class SmallSubjectEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 1000 })
  detail: string;

  @Column()
  date: Date;

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
