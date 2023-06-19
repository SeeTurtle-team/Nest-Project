import { IsNumber } from 'class-validator';

export class GetUpdateBoardtDto {
  @IsNumber()
  boardId: number;

  @IsNumber()
  userId: number;
}
