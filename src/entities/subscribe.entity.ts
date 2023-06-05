import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('subscribe')
export class SubscribeEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  subKey: number;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.subscribeEntities)
  user: UserEntity;
}
