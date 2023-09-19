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
import { SmallSubjectEntity } from './smallSubject.entity';
import { EbookStarRatingEntity } from './ebookStarRating.entity';
import { EbookSeriesEntity } from './ebookSeries.entity';
import { QnaEntity } from './qna/qna.entity';
import { QnaCommentEntity } from './qna/qnacomment.entity';

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

  @Column({ default: null })
  birth: Date;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 50 })
  email: string;

  @Column({ type: 'enum', enum: UserStatus })
  userLoginType: UserStatus;

  @Column({ length: 1000 })
  img: string;

  @ManyToOne((type) => JobEntity, (jobEntity) => jobEntity.userEntities)
  job: JobEntity;

  @OneToMany((type) => BoardEntity, (boardEntity) => boardEntity.user)
  boardEntities: BoardEntity[];
  @OneToMany((type) => QnaEntity, (qnaEntities) => qnaEntities.user)
  Qnaentities: QnaEntity[];
  @OneToMany((type) => QnaCommentEntity, (qnacommentEntities) => qnacommentEntities.user)
  QnacommentEntities: QnaCommentEntity[];
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

  @OneToMany(
    (type) => SmallSubjectEntity,
    (smallSubjectEntity) => smallSubjectEntity.user,
  )
  smallSubjectEntities: SmallSubjectEntity[];

  @OneToMany(
    (type) => EbookStarRatingEntity,
    (ebookStarRatingEntity) => ebookStarRatingEntity.user,
  )
  ebookStarRatingEntities: EbookStarRatingEntity[];

  @OneToMany(
    (type) => EbookSeriesEntity,
    (ebookSeriesEntity) => ebookSeriesEntity.user,
  )
  ebookSeriesEntities: EbookSeriesEntity[];
}
