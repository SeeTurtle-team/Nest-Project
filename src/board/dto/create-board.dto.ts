import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly contents: string;

  @IsNumber()
  readonly boardCategoryId: number;

  @IsOptional()
  @IsString()
  readonly imgUrl: string;
}
