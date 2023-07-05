import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { EmailCheckCodeEntity } from 'src/entities/emailCheckCode.entity';
import { UserStatus } from './enumType/UserStatus';
import { userGrade } from 'src/Common/userGrade';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailCheckCodeEntity)
    private readonly emailCheckCodeRepository: Repository<EmailCheckCodeEntity>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async findOne(userId) {
    try {
      return this.userRepository.findOne({
        where: {
          userId: userId,
          emailCheck: true,
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
    console.log("hhhhhhhhh")
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

      //코드를 보니까 위에 userEntity에 매핑하기 전에 이 밑에 체크를 먼저하는게 리소스를 좀 더 아낄 수 있지 않을까 생각이 듭니다!!
      const checkUserId = await this.userIdCheck(user.userId);
      if (checkUserId.success === false) return checkUserId;
      const checkNickname = await this.nicknameCheck(user.nickname);
      if (checkNickname.success === false) return checkNickname;
      const checkEmail = await this.emailCheck(user.email);
      if (checkEmail.success === false) return checkEmail;

      await this.sendVerificationCode({ email: user.email });

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

  async sendVerificationCode(email) {
    try {
      const code = this.generateFourRandomCode();
      await this.mailerService
        .sendMail({
          to: email.email,
          from: 'noreply@gmail.com',
          subject: 'email verification code',
          text: code,
        })
        .then((result) => {
          this.logger.log(result);
        });
      await this.saveVerificationCode(email.email, code);

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '코드 전송 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async updateVerificationCode(email, code) {
    try {
      await this.emailCheckCodeRepository
        .createQueryBuilder()
        .update()
        .set({
          code: code,
        })
        .where('email = :email', { email: email })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '코드 업데이트 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async saveVerificationCode(email, code) {
    try {
      const check = await this.getVerificationCode(email);
      if (!!check) await this.updateVerificationCode(email, code);
      else {
        const emailCode = new EmailCheckCodeEntity();
        emailCode.email = email;
        emailCode.code = code;

        await this.emailCheckCodeRepository.save(emailCode);
      }

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '코드 저장 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getVerificationCode(email) {
    try {
      return await this.emailCheckCodeRepository.findOne({
        where: {
          email: email,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '인증 코드 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async toggleEmailCheck(email) {
    try {
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({
          emailCheck: true,
        })
        .where('email = :email', { email: email })
        .execute();
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'emailCheck 토글 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async checkVerificationCode(checkCodeDto) {
    try {
      const dbObj = await this.getVerificationCode(checkCodeDto.email);
      if (dbObj.code === checkCodeDto.code) {
        await this.toggleEmailCheck(checkCodeDto.email);
        return { success: true };
      } else return { success: false, msg: '코드 인증 실패' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '코드 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async googleLogin(googleLoginDto) {
    try {
      const googleToken = this.jwtService.decode(googleLoginDto.token)
      const email = googleToken['email'];
      const checkEmail = await this.emailCheck(email);
      
      // if(checkEmail.success){
      //   googleUser = await this.insertGoogle(googleToken,2);
      // }else{
      //   goo
      // }     

      const googleUser = checkEmail.success ? await this.insertGoogle(googleToken,2) : await this.selectGoogleUser(email)
      const res =  await this.googleSignIn(googleUser);
      
      console.log(res);
      
      return res;
      
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

  async insertGoogle(googleToken,defaultGrade){
    try{
      const user = new UserEntity();
      user.name = googleToken.name;
      user.nickname = googleToken.name;
      user.email = googleToken.email;
      user.userId = googleToken.email;
      user.userLoginType = UserStatus.google;
      user.userGrade = defaultGrade
      user.img = googleToken.picture;
      user.password=''
     
      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(user.password, salt);
      user.password = hashedPw;

      const res = await this.userRepository.save(user);

      return res;
    }catch(err){
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '구글 로그인 에러',
          success: false,
        },
        500,
      )
    }
  }

  /**리팩토링 예정 순환 종속성 발생 */
  async getJwtToken(payload) {
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async googleSignIn(googleUser){
    try{
      const payload = {
        sub:googleUser.id,
        username: googleUser.name,
        nickname : googleUser.nickname,
        imgUrl : googleUser.imgUrl
      }

      const jwtToken = await this.getJwtToken(payload);

      return jwtToken;

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

  async selectGoogleUser(email:string){
    try{
      const res = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });

      return res;

    }catch(err){
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '구글 로그인 유저 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
}
