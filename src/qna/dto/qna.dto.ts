import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export abstract class abstractqnaDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly contents: string;

  @IsOptional()
  @IsBoolean()
  readonly isSecret: boolean;

  @IsOptional()
  @IsString()
  readonly imgUrl: string;
}
export class CreateQnaDto extends abstractqnaDto
{

}
export class UpdateQnaDto extends PartialType(CreateQnaDto)
{
  @IsNumber()
  readonly qnaId:number;
}
export class DeleteQnaDto
{
  @IsNumber()
  readonly qnaId:number;
}