import { IsString } from 'class-validator';

export class GetForgottenIdDto {
  @IsString()
  readonly email: string;
}
