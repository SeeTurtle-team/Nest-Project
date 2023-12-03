import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../enumType/UserStatus';
import { userGrade } from 'src/Common/userGrade';

export class CreateUserDto {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly password: string;

  @IsString()
  readonly name: string;

  @IsString()
  readonly birth: string;

  @IsString()
  readonly nickname: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly userLoginType: UserStatus;

  @IsNumber()
  readonly userGradeId: userGrade;

  @IsOptional()
  @IsNumber()
  readonly jobId?: number;
}
