import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import {abstractqnaDto} from 'src/qna/dto/qna.dto'
export class CreateQnaCommentDto extends abstractqnaDto
{
    @IsOptional()
    @IsNumber()
    parentId:number;
}
export class UpdateQnaCommentDto extends PartialType(CreateQnaCommentDto)
{
  @IsNumber()
  readonly qnaCommentId: number;
}
export class DeleteQnaCommentDto {
    @IsNumber() readonly qnaCommentId: number;
}