import { Controller, Logger, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @ApiOperation({ summary: '로그인' })
  @Post()
  async signIn(@Body() signInDto: SignInDto) {
    this.logger.log('-----POST /auth');
    return this.authService.signIn(signInDto);
  }
}
