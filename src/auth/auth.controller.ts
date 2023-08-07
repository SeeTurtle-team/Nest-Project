import { Controller, Logger, Post, Body, Get, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Public()
  @ApiOperation({ summary: '로그인' })
  @Post()
  async signIn(@Body() signInDto: SignInDto) {
    this.logger.log('-----POST /auth');
    return this.authService.signIn(signInDto);
  }

  // @Public()
  // @ApiOperation({ summary : '구글 로그인 후 토근 생성'})
  // @Get('/google')
  // async getGoogleLoginToken(@Headers() header){
  //   this.logger.log('-----GET /auth/google');
  //   return await this.authService.getGoogleLoginToken(header);
  // }

}
