import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class StarRateDto {
  @IsInt()
  @Min(1)
  @Max(10)
  readonly starRating: number;

  @IsNumber()
  readonly ebookId: number;
}
