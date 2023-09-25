import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { abstractEntity } from '../abstract.entity';
import { QnaCommentEntity } from './qnacomment.entity';
import { UserEntity } from '../user.entity';  
@Entity('Qna')
  export class QnaEntity extends abstractEntity
  {
    @Column({default:false})
    issecret: boolean

    @Column({default:false})
    isanswered: boolean

    @Column({default:"anonymous"})
    username: string

    @ManyToOne((type) => UserEntity, (userentity) => userentity.Qnaentities)
    user: UserEntity;
    
    @OneToMany((type)=>QnaCommentEntity,(qnaCommentEntities)=>qnaCommentEntities.Qna)
    QnaComments: QnaCommentEntity[]
  }