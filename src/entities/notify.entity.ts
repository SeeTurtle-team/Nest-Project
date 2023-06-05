import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('notify')
export class NotifyEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  contents: string;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.notifyEntities)
  user: UserEntity;
}
