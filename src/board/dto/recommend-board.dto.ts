import { IsBoolean, IsNumber } from 'class-validator';

export class RecommendBoardDto {
  @IsNumber()
  readonly userId: number;

  @IsNumber()
  readonly boardId: number;

  @IsBoolean()
  readonly check: boolean;
}
