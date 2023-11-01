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
  @Entity('qnaComment')
  export class QnaCommentEntity extends abstractEntity
  {
    @Column({default:false})
    issecret: boolean
    @Column({default:"anonymous"})
    username: string
    @ManyToOne((Type)=>QnaEntity,(Qnaentities)=>Qnaentities.qnaComments,{
      onDelete: 'CASCADE',
  })
    qna:QnaEntity
    @ManyToOne((type) => UserEntity, (userentity) => userentity.qnacommentEntities)
    user: UserEntity;
    @Column({default:null,nullable:true})
    parentId:number
  }