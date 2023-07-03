import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckCodeDto } from './dto/check-email.dto';

@Controller('user')
@ApiTags('User API')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  @ApiOperation({ summary: '회원 가입' })
  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    this.logger.log('-----POST /user/signup');
    return this.userService.signUp(createUserDto);
  }

  @ApiOperation({ summary: '이메일 코드 인증' })
  @Post('/checkcode')
  async checkCode(@Body() checkCodeDto: CheckCodeDto) {
    this.logger.log('-----POST /user/authemail');
    return this.userService.checkVerificationCode(checkCodeDto);
  }

  @ApiOperation({ summary: '이메일 코드 재전송' })
  @Post('/resendcode')
  async resendCode(@Body() email: string) {
    this.logger.log('-----POST /user/resnedcode');
    return this.userService.sendVerificationCode(email);
  }

  @Post('/google')
  async googleLogin(@Body() googleLoginDto) {
    this.logger.log('-----POST /user/google');
    return await this.userService.googleLogin(googleLoginDto);
  }
}
