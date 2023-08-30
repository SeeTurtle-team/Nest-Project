import { IsNumber } from 'class-validator';
import { CreateSeriesDto } from './create-series.dto';

export class UpdateSeriesDto extends CreateSeriesDto {
  @IsNumber()
  id: number;
}
