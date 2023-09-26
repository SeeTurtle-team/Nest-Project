import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { abstractEntity } from '../abstract.entity';
import { QnaEntity } from './qna.entity';
import { UserEntity } from '../user.entity';  
  @Entity('qnacomment')
  export class QnaCommentEntity extends abstractEntity
  {
    @Column({default:false})
    issecret: boolean
    @Column({default:false})
    isanswered: boolean
    @Column({default:"anonymous"})
    username: string
    @ManyToOne((Type)=>QnaEntity,(Qnaentities)=>Qnaentities.QnaComments)
    Qna:QnaEntity
    @ManyToOne((type) => UserEntity, (userentity) => userentity.QnacommentEntities)
    user: UserEntity;
    @Column()
    userId:number
  }