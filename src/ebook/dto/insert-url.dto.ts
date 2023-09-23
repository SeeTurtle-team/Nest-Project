import { IsNumber, IsString } from 'class-validator';

export class InsertUrlDto {
  @IsString()
  readonly url: string;

  @IsNumber()
  readonly ebookId: number;
}
