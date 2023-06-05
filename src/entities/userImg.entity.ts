import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('userImg')
export class UserImgEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  imgUrl: string;

  @ManyToOne((type) => UserEntity, (userEntity) => userEntity.userImgEntities)
  user: UserEntity;
}
