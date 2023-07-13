import { IsNumber } from 'class-validator';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends CreateBoardDto {
  @IsNumber()
  id: number;

  @IsNumber()
  userId: number;
}
