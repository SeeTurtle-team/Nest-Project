import { IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly password: string;
}
