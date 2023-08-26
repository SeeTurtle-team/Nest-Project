import { IsString } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  seriesName: string;
}
