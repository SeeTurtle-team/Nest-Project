import { IsNumber, IsString } from "class-validator";

export class InsertSmallTalkDto {
    @IsString()
    readonly contents:string

    @IsNumber()
    readonly smallSubjectId:number;

}