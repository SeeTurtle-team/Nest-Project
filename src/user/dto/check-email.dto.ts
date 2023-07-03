import { IsString } from 'class-validator';

export class CheckCodeDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly code: string;
}
