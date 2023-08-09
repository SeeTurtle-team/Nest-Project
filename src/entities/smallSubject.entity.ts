import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SmallTalkEntity } from './smallTalk.entity';
import { UserEntity } from './user.entity';

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

  @Column({ length: 500, nullable:true })
  imgUrl : string;

  @OneToMany(
    (type) => SmallTalkEntity,
    (smallTalkEntity) => smallTalkEntity.smallSubject,
  )
  smallTalkEntities: SmallTalkEntity[];

  @ManyToOne(
    (type) => UserEntity,
    (userEntity) => (userEntity.smallSubjectEntities)
  )
  user : UserEntity;
}
