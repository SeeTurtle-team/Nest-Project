import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import {abstractqnaDto} from 'src/qna/dto/qna.dto'
export class CreateQnaCommentDto extends abstractqnaDto
{
    @IsOptional()
    @IsNumber()
    Parentid:number;
}