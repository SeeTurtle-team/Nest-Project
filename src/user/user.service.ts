import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService
  ) { }
  private readonly logger = new Logger(UserService.name);

  async findOne(userId) {
    try {
      return this.userRepository.findOne({
        where: {
          userId: userId,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getIds() {
    try {
      return await this.userRepository.find({
        select: {
          userId: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '아이디 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getNicknames() {
    try {
      return await this.userRepository.find({
        select: {
          nickname: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '닉네임 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getEmails() {
    try {
      return await this.userRepository.find({
        select: {
          email: true,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '이메일 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async userIdCheck(userId) {
    try {
      const ids = await this.getIds();
      const check = ids.find((e) => e.userId === userId);
      if (check) return { success: false, msg: '아이디 중복' };
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '아이디 중복 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async nicknameCheck(nickname) {
    try {
      const nicknames = await this.getNicknames();
      const check = nicknames.find((e) => e.nickname === nickname);
      if (check) return { success: false, msg: '닉네임 중복' };
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '닉네임 중복 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async emailCheck(email) {
    try {
      const emails = await this.getEmails();
      const check = emails.find((e) => e.email === email);
      if (check) return { success: false, msg: '이메일 중복' };
      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '이메일 중복 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async signUp(createUserDto) {
    try {
      const user = new UserEntity();
      user.userId = createUserDto.userId;
      user.password = createUserDto.password;
      user.name = createUserDto.name;
      user.birth = createUserDto.birth;
      user.nickname = createUserDto.nickname;
      user.email = createUserDto.email;
      user.userLoginType = createUserDto.userLoginType;
      user.userGrade = createUserDto.userGradeId;

      const checkUserId = await this.userIdCheck(user.userId);
      if (checkUserId.success === false) return checkUserId;
      const checkNickname = await this.nicknameCheck(user.nickname);
      if (checkNickname.success === false) return checkNickname;
      const checkEmail = await this.emailCheck(user.email);
      if (checkEmail.success === false) return checkEmail;

      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(user.password, salt);
      user.password = hashedPw;

      //이미지는 나중에
      user.img = 'false';

      await this.userRepository.save(user);

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '회원 가입 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  public generateFourRandomCode() {
    let str = '';
    for (let i = 0; i < 4; i++) {
      str += Math.floor(Math.random() * 10);
    }
    return str;
  }

  async sendVerificationCode(body) {
    try {
      const code = this.generateFourRandomCode();
      await this.mailerService
        .sendMail({
          to: body.email,
          from: 'noreply@gmail.com',
          subject: 'email verification code',
          text: code,
          // html: `
          // click this button to signup</br>
          // <form action="asdfasdf" method="POST">
          // <button>confirm</button>
          // </form>`,
        })
        .then((result) => {
          this.logger.log(result);
        });

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '이메일 인증 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async googleLogin(googleLoginDto) {
    try {
      const test = this.jwtService.decode(googleLoginDto.token)
      console.log(test)

      const checkEmail = await this.emailCheck(test['email']);

      
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '구글 로그인 에러',
          success: false,
        },
        500,
      );
    }
  }
}
