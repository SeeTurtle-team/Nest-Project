import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('randomSubject')
export class RandomSubjectEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ length: 1000 })
    detail: string;

    @Column()
    isDeleted: Boolean;

    @Column()
    isModified: Boolean;

    @Column({ length: 500, nullable: true })
    imgUrl: string;

}