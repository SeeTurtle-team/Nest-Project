import { IsNumber } from "class-validator";

export class DeleteSmallSubDto{
    @IsNumber()
    id : number;

    @IsNumber()
    userId : number;
}