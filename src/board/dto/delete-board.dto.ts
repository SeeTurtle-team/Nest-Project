import { IsNumber } from 'class-validator';

export class DeleteBoardDto {
  @IsNumber()
  id: number;

  @IsNumber()
  userId: number;
}
