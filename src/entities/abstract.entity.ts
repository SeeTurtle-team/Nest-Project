import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  @Entity('abstract')
  export abstract class abstractEntity{
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({ length: 100 })
    title: string;
  
    @Column({ length: 1000, nullable: true })
    contents: string;
  
    @Column()
    dateTime: Date;
  
    @Column()
    isDeleted: Boolean;
  
    @Column()
    isModified: Boolean;
    @Column({nullable:true})
    imgUrl:string;
    @Column({ type: 'boolean',default:false, nullable: false})
    ban: boolean;
  }