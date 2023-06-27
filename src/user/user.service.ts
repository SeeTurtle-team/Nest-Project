import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailerService: MailerService,
  ) { }
  private readonly logger = new Logger(UserService.name);

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

 /**여기서 이메일을 파라미터로 전달 받아서 */
  public example(): void {
    try{
      this.mailerService
      .sendMail({
        to: 'rtw2343@naver.com', // list of receivers 여기에 넣어주면 됩니다
        from: process.env.EMAIL_ID, // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body 내용 부분에 인증번호 보내주고요
        html: '<b>welcome</b>', // HTML body content
      })
      
    }catch(err){
        this.logger.error(err);
    }
   
  }
}
