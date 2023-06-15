import { userGrade } from "src/Common/userGrade";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('userGrade')
export class UserGradeEntity{
    @PrimaryGeneratedColumn('increment')
    id : number;

    @Column({type:'enum', enum : userGrade})
    userGrade : userGrade

    @OneToMany(
        (type) => UserEntity,
        userEntity => userEntity.userGrade
    )
    userEntities : UserEntity[];
}