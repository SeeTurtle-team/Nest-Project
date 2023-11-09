import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class accepctedEbookListDto {
  @IsArray()
  readonly accepctedList: number[];
}export class rejectedEbookListDto 
{
  @IsArray()
  readonly rejectedList: number[];
}