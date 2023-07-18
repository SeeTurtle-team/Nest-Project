import { IsDate, IsNumber, IsString } from 'class-validator';

export class InsertNotifyDto {
  @IsString()
  readonly reason: string;

  @IsNumber()
  readonly boardId: number;
}
