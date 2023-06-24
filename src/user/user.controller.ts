import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
}
