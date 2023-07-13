import { IsNumber } from 'class-validator';

export class RecommendBoardDto {
  @IsNumber()
  readonly boardId: number;
}
