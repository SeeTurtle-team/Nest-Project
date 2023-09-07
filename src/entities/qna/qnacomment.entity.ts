import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
  } from 'typeorm';
  import { abstractEntity } from '../abstract.entity';
import { QnaEntity } from './qna.entity';
import { UserEntity } from '../user.entity';  
  @Entity('qnacomment')
  @Tree("closure-table")
  export class QnaCommentEntity extends abstractEntity
  {
    @Column({default:false})
    issecret: boolean
    @Column({default:false})
    isanswered: boolean
    @Column({default:"anonymous"})
    username: string
    @ManyToOne((Type)=>QnaEntity,(Qnaentities)=>Qnaentities.QnaCommentEntity)
    QnaEntity:QnaEntity
    @ManyToOne((type) => UserEntity, (userentity) => userentity.QnacommentEntities)
    user: UserEntity;
    @Column()
    userId:number
    @TreeParent()
    parnet:QnaCommentEntity
    @TreeChildren()
    children:QnaCommentEntity[]
  }