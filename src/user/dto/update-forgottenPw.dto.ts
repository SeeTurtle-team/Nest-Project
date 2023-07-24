import { IsString } from 'class-validator';
import { GetForgottenIdDto } from './get-forgottenId.dto';

export class UpdateForgottenPwDto extends GetForgottenIdDto {
  @IsString()
  readonly password: string;
}
