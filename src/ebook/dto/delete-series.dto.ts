import { IsNumber } from 'class-validator';

export class DeleteSeriesDto {
  @IsNumber()
  id: number;
}
