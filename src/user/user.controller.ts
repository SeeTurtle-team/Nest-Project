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

  @ApiOperation({ summary: '이메일 인증 코드 전송' })
  @Post('/sendcode')
  async sendCode(@Body() email: string) {
    this.logger.log('-----POST /user/resendcode');
    return this.userService.sendVerificationCode(email);
  }

  @ApiOperation({ summary: '아이디 중복 검사' })
  @Post('/id')
  async checkId(@Body() userId: string) {
    this.logger.log('-----POST /user/id');
    return await this.userService.userIdCheck(userId);
  }

  @ApiOperation({ summary: '닉네임 중복 검사' })
  @Post('/nickname')
  async checkNickname(@Body() nickname: string) {
    this.logger.log('-----POST /user/nickname');
    return await this.userService.nicknameCheck(nickname);
  }

  @ApiOperation({ summary: '이메일 중복 검사' })
  @Post('/email')
  async checkEmail(@Body() email: string) {
    this.logger.log('-----POST /user/email');
    return await this.userService.emailCheck(email);
  }

  @ApiOperation({ summary: '구글 로그인' })
  @Post('/google')
  async googleLogin(@Body() googleLoginDto) {
    this.logger.log('-----POST /user/google');
    return await this.userService.googleLogin(googleLoginDto);
  }

  @ApiOperation({ summary: '카카오 로그인' })
  @Post('/kakao')
  async kakaoLogin(@Body() kakaoLoginDto) {
    //return await this.userService.kakaoLogin(kakaoLoginDto);
  }

  @Post('/test')
  async test(@Body() email: string) {
    return await this.userService.emailCodeCheck(email);
  }
}
