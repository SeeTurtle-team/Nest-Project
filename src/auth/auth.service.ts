import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/signIn.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async getJwtToken(payload) {
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.getUser(signInDto.userId);
      if (!user) return { success: false, msg: '존재하지 않는 아이디입니다.' };
      const check = await bcrypt.compare(signInDto.password, user.password);
      if (!check)
        return { success: false, msg: '비밀번호가 일치하지 않습니다.' };

      return this.returnJwtToken(user);
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '로그인 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async returnJwtToken(user) {
    try {
      const url = await this.usersService.getUserImgUrl(user.id);
      const payload = {
        userId: user.id,
        username: user.name,
        nickname: user.nickname,
        imgUrl: url.imgUrl,
      };
      console.log(payload);
      const jwtToken = await this.getJwtToken(payload);

      return { success: true, jwtToken };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '로그인 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getUser(userId) {
    try {
      const user = await this.usersService.findOne(userId);

      return user;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '로그인 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  // async getGoogleLoginToken(header){
  //   try{
  //     const token = header.authorization.replace('Bearer ', '');
  //     const decodetoken = this.jwtService.decode(token);
  //     console.log(decodetoken);

  //     const user = await this.getUser(decodetoken['id']);

  //   }catch(err){
  //     this.logger.error(err);
  //   }
  // }
}
