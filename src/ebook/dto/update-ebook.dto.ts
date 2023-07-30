import { IsNumber } from 'class-validator';
import { CreateEbookDto } from './create-ebook.dto';

export class UpdateEbookDto extends CreateEbookDto {
  @IsNumber()
  id: number;
}
