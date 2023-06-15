import { IsNumber } from "class-validator";

export class BanBoardDto{
    @IsNumber()
    boardId : number;

    @IsNumber()
    boardNotifyId : number;
}