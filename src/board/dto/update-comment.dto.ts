import { IsNumber } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends CreateCommentDto {
  @IsNumber()
  id: number;

  @IsNumber()
  userId: number;
}
