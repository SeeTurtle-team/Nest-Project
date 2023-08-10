import { IsNumber, IsString } from "class-validator";

export class InsertSmallTalkDto {
    @IsString()
    contents:string

    @IsNumber()
    smallSubjectId:number;

}