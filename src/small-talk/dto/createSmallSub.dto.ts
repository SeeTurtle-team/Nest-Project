import { IsNumber, IsString } from "class-validator";

export class CreateSmallSub{
    @IsString()
    readonly title : string;

    @IsString()
    readonly detail : string;

}