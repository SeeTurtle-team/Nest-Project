import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserStatus } from 'src/user/enumType/UserStatus';
import { BoardEntity } from './board.entity';
import { BoardCommentEntity } from './boardComment.entity';
import { NotifyEntity } from './notify.entity';
import { JobEntity } from './job.entity';
import { EbookEntity } from './ebook.entity';
import { EbookCommentEntity } from './ebookComment.entity';
import { EbookRatingEntity } from './ebookRating.entity';
import { SubscribeEntity } from './subscribe.entity';
import { UserImgEntity } from './userImg.entity';
import { SmallTalkEntity } from './smallTalk.entity';
import { BoardRecommendEntity } from './boardRecommend.entity';
import { BoardNotifyEntity } from './boardNotify.entity';
import { UserGradeEntity } from './userGrade.Entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 50 })
  userId: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  birth: Date;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50 })
  email: string;

  @Column({ type: 'enum', enum: UserStatus })
  userLoginType: UserStatus;

  @Column({ length: 1000 })
  img: string;

  @Column({ default: false })
  emailCheck: Boolean;

  @ManyToOne((type) => JobEntity, (jobEntity) => jobEntity.userEntities)
  job: JobEntity;

  @OneToMany((type) => BoardEntity, (boardEntity) => boardEntity.user)
  boardEntities: BoardEntity[];

  @OneToMany(
    (type) => BoardCommentEntity,
    (boardCommentEntity) => boardCommentEntity.user,
  )
  boardCommentEntities: BoardCommentEntity[];

  @OneToMany((type) => NotifyEntity, (notifyEntity) => notifyEntity.user)
  notifyEntities: NotifyEntity[];

  @OneToMany((type) => EbookEntity, (ebookEntity) => ebookEntity.user)
  ebookEntities: EbookEntity[];

  @OneToMany(
    (type) => EbookCommentEntity,
    (ebookCommentEntity) => ebookCommentEntity.user,
  )
  ebookCommentEntities: EbookCommentEntity[];

  @OneToMany(
    (type) => EbookRatingEntity,
    (ebookRatingEntity) => ebookRatingEntity.user,
  )
  ebookRatingEntities: EbookRatingEntity[];

  @OneToMany(
    (type) => SubscribeEntity,
    (subscribeEntity) => subscribeEntity.user,
  )
  subscribeEntities: SubscribeEntity[];

  @OneToMany((type) => UserImgEntity, (userImgEntity) => userImgEntity.user)
  userImgEntities: UserImgEntity[];

  @OneToMany(
    (type) => SmallTalkEntity,
    (smallTalkEntity) => smallTalkEntity.user,
  )
  smallTalkEntities: SmallTalkEntity[];

  @OneToMany(
    (type) => BoardRecommendEntity,
    (boardRecommendEntity) => boardRecommendEntity.user,
  )
  boardRecommendEntities: BoardRecommendEntity[];

  @OneToMany(
    (type) => BoardNotifyEntity,
    (boardNotifyEntity) => boardNotifyEntity.user,
  )
  boardNotifyEntities: BoardNotifyEntity[];

  @ManyToOne(
    (type) => UserGradeEntity,
    (userGradeEntity) => userGradeEntity.userEntities,
  )
  userGrade: UserGradeEntity;
}
