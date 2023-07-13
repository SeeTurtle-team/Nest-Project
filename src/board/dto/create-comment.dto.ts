import { IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  readonly contents: string;

  @IsNumber()
  readonly boardId: number;
}
