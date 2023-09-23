import { IsNumber } from 'class-validator';

export class DeleteUrlDto {
  @IsNumber()
  readonly ebookId: number;
}
