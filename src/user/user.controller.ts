import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Headers,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckCodeDto } from './dto/check-email.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateForgottenPwDto } from './dto/update-forgottenPw.dto';
import { GetForgottenIdDto } from './dto/get-forgottenId.dto';

@Controller('user')
@ApiTags('User API')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  @Public()
  @ApiOperation({ summary: '회원 가입' })
  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    this.logger.log('-----POST /user/signup');
    return this.userService.signUp(createUserDto);
  }

  @Public()
  @ApiOperation({ summary: '이메일 코드 인증' })
  @Post('/checkcode')
  async checkCode(@Body() checkCodeDto: CheckCodeDto) {
    this.logger.log('-----POST /user/authemail');
    return this.userService.checkVerificationCode(checkCodeDto);
  }

  @Public()
  @ApiOperation({ summary: '이메일 인증 코드 전송' })
  @Post('/sendcode')
  async sendCode(@Body() email: string) {
    this.logger.log('-----POST /user/sendcode');
    return this.userService.sendVerificationCode(email);
  }

  @Public()
  @ApiOperation({ summary: '아이디 중복 검사' })
  @Post('/id')
  async checkId(@Body() userId: string) {
    this.logger.log('-----POST /user/id');
    return await this.userService.userIdCheck(userId);
  }

  @Public()
  @ApiOperation({ summary: '닉네임 중복 검사' })
  @Post('/nickname')
  async checkNickname(@Body() nickname: string) {
    this.logger.log('-----POST /user/nickname');
    return await this.userService.nicknameCheck(nickname);
  }

  @Public()
  @ApiOperation({ summary: '이메일 중복 검사' })
  @Post('/email')
  async checkEmail(@Body() email: string) {
    this.logger.log('-----POST /user/email');
    return await this.userService.emailCheck(email);
  }

  @Public()
  @ApiOperation({ summary: '구글 로그인' })
  @Post('/google')
  async googleLogin(@Body() googleLoginDto) {
    this.logger.log('-----POST /user/google');
    return await this.userService.googleLogin(googleLoginDto);
  }

  @Public()
  @ApiOperation({ summary: '카카오 로그인' })
  @Post('/kakao')
  async kakaoLogin(@Body() kakaoLoginDto) {
    //return await this.userService.kakaoLogin(kakaoLoginDto);
  }

  @ApiOperation({ summary: '수정 전 유저 정보 가져오기' })
  @Get()
  async getUser(@Headers() headers) {
    return await this.userService.getUser(headers);
  }

  @ApiOperation({ summary: '유저 정보 수정' })
  @Patch()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Headers() headers) {
    return await this.userService.updateUser(updateUserDto, headers);
  }

  @Public()
  @ApiOperation({ summary: '분실 아이디 찾기' })
  @Get('/help/id')
  async getForgottenId(@Body() getForgottenIdDto: GetForgottenIdDto) {
    return await this.userService.getForgottenId(getForgottenIdDto.email);
  }

  @Public()
  @ApiOperation({ summary: '분실 비밀번호 재설정' })
  @Patch('/help/pw')
  async patchForgottenPw(@Body() updateForgottenPwDto: UpdateForgottenPwDto) {
    return await this.userService.patchForgottenPw(updateForgottenPwDto);
  }
}
