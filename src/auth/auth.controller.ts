import { Controller, Logger, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post()
  async signIn(@Body() signInDto: SignInDto) {
    this.logger.log('POST /auth');
    return this.authService.signIn(signInDto);
  }
}
