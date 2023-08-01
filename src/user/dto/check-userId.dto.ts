import { IsString } from 'class-validator';

export class CheckUserIdDto {
  @IsString()
  userId: string;

  @IsString()
  email: string;
}
