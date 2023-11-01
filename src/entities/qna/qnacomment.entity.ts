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
  @Entity('QnaComment')
  export class QnaCommentEntity extends abstractEntity
  {
    @Column({default:false})
    issecret: boolean
    @Column({default:"anonymous"})
    username: string
    @ManyToOne((Type)=>QnaEntity,(Qnaentities)=>Qnaentities.QnaComments)
    Qna:QnaEntity
    @ManyToOne((type) => UserEntity, (userentity) => userentity.QnacommentEntities)
    user: UserEntity;
    @Column()
    userId:number
    @Column({default:null,nullable:true})
    parentId:number
  }