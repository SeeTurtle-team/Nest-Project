import { IsNumber, IsString } from 'class-validator';

export class CreateEbookDto {
  @IsString()
  readonly title: string;

  @IsNumber()
  readonly boardCategoryId: number;

  @IsString()
  readonly contents: string;
}
