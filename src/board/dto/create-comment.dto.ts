import { IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  readonly contents: string;

  @IsNumber()
  readonly userId: number;

  @IsNumber()
  readonly boardId: number;
}
