import { IsNumber } from 'class-validator';

export class StarRateDto {
  @IsNumber()
  readonly starRating: number;

  @IsNumber()
  readonly ebookId: number;
}
