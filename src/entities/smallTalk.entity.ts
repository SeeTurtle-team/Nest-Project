import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SmallSubjectEntity } from './smallSubject.entity';
import { UserEntity } from './user.entity';

@Entity('smallTalk')
export class SmallTalkEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  contents: string;

  @Column()
  isDeleted: Boolean;

  @ManyToOne(
    (type) => SmallSubjectEntity,
    (smallSubjectEntity) => smallSubjectEntity.smallTalkEntities,
  )
  smallSubject: SmallSubjectEntity;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.smallTalkEntities)
  user: UserEntity;
}
