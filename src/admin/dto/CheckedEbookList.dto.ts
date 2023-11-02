import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CheckedEbookListDto {
  @IsOptional()
  @IsArray()
  readonly accepctedList: number[];
  @IsOptional()
  @IsArray()
  readonly rejectedList: number[];

}