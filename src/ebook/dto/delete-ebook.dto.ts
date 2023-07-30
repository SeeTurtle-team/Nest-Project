import { IsNumber } from 'class-validator';

export class DeleteEbookDto {
  @IsNumber()
  id: number;
}
