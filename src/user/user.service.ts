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
import axios from 'axios';
import { GetToken } from 'src/utils/GetToken';
import { GetS3Url } from 'src/utils/GetS3Url';
import { UserImgEntity } from 'src/entities/userImg.entity';
import { checkTokenId } from 'src/utils/CheckToken';
import { BoardService } from 'src/board/board.service';
import { EbookService } from 'src/ebook/ebook.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailCheckCodeEntity)
    private readonly emailCheckCodeRepository: Repository<EmailCheckCodeEntity>,
    @InjectRepository(UserImgEntity)
    private readonly userImgRepository: Repository<UserImgEntity>,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly getToken: GetToken,
    private readonly getS3Url: GetS3Url,
    private readonly boardService: BoardService,
    private readonly ebookService: EbookService,
    private readonly redisService: RedisService,
  ) {}
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

  async getId(userId) {
    try {
      const result = await this.userRepository.find({
        select: {
          id: true,
        },
        where: {
          userId: userId,
        },
      });
      return result[0].id;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'ID 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getUserId(userId) {
    try {
      return await this.userRepository.find({
        select: {
          userId: true,
        },
        where: {
          userId: userId,
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

  async getNickname(nickname) {
    try {
      return await this.userRepository.find({
        select: {
          nickname: true,
        },
        where: {
          nickname: nickname,
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

  async getEmail(email) {
    try {
      return await this.userRepository.find({
        select: {
          email: true,
        },
        where: {
          email: email,
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

  async getUserImgUrl(userId) {
    try {
      const result = await this.userImgRepository.query(`
          select "imgUrl" from "userImg" where "userId" = ${userId};
      `);

      return result[0] ? result[0] : { imgUrl: 'noUrl' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 이미지 url 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async userIdCheck(userId) {
    try {
      const check = await this.getUserId(userId.userId || userId);
      if (check[0]) return { success: false, msg: '아이디 중복' };
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
      const check = await this.getNickname(nickname.nickname || nickname);
      if (check[0]) return { success: false, msg: '닉네임 중복' };
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
      const check = await this.getEmail(email.email || email);
      if (check[0]) return { success: false, msg: '이메일 중복' };
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

  async emailCodeCheck(email) {
    try {
      const emailCheck = await this.getVerificationCode(email);
      if (emailCheck?.check === undefined || emailCheck?.check === false) {
        return { success: false, msg: '이메일 인증 확인 불가' };
      } else return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '이메일 인증 여부 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async signUp(createUserDto) {
    try {
      const checkUserId = await this.userIdCheck(createUserDto.userId);
      if (checkUserId.success === false) return checkUserId;
      const checkNickname = await this.nicknameCheck(createUserDto.nickname);
      if (checkNickname.success === false) return checkNickname;
      const checkEmail = await this.emailCheck(createUserDto.email);
      if (checkEmail.success === false) return checkEmail;
      const authEmail = await this.emailCodeCheck(createUserDto.email);
      if (authEmail.success === false) return authEmail;

      const user = new UserEntity();
      user.userId = createUserDto.userId;
      user.password = createUserDto.password;
      user.name = createUserDto.name;
      user.birth = createUserDto.birth;
      user.nickname = createUserDto.nickname;
      user.email = createUserDto.email;
      user.userLoginType = createUserDto.userLoginType;
      user.userGrade = createUserDto.userGradeId;

      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(user.password, salt);
      user.password = hashedPw;

      await this.userRepository.save(user);

      if (createUserDto.img) {
        const id = await this.getId(createUserDto.userId);
        await this.insertUrl(createUserDto.img, id);
      }

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
      await this.saveVerificationCode(email.email);

      // 캐시 설정 key: email, value: code
      await this.redisService.set(email.email, code);
      console.log(code);
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

  async updateVerificationCode(email) {
    try {
      await this.emailCheckCodeRepository
        .createQueryBuilder()
        .update()
        .set({
          check: false,
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

  async saveVerificationCode(email) {
    try {
      const check = await this.getVerificationCode(email);
      if (!!check) {
        await this.updateVerificationCode(email);
      } else {
        const emailCode = new EmailCheckCodeEntity();
        emailCode.email = email;
        emailCode.check = false;

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
      await this.emailCheckCodeRepository
        .createQueryBuilder()
        .update()
        .set({
          check: true,
        })
        .where('email = :email', { email: email })
        .execute();

      // 할당했던 캐시 삭제
      await this.redisService.del(email);
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
      // const dbObj = await this.getVerificationCode(checkCodeDto.email);
      const cacheCode = await this.redisService.get(checkCodeDto.email);
      if (cacheCode === checkCodeDto.code) {
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
      const googleToken = this.jwtService.decode(googleLoginDto.token);
      const email = googleToken['email'];
      const checkEmail = await this.emailCheck(email);

      const googleUser = checkEmail.success
        ? await this.insertGoogle(googleToken, 2)
        : await this.selectGoogleUser(email);
      const res = await this.googleSignIn(googleUser);

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

  async insertGoogle(googleToken, defaultGrade) {
    try {
      const user = new UserEntity();
      user.name = googleToken.name;
      user.nickname = googleToken.name;
      user.email = googleToken.email;
      user.userId = googleToken.email;
      user.userLoginType = UserStatus.google;
      user.userGrade = defaultGrade;
      // user.img = googleToken.picture; 이미지 추가 필
      user.password = '';

      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(user.password, salt);
      user.password = hashedPw;

      const res = await this.userRepository.save(user);

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

  /**리팩토링 예정 순환 종속성 발생 */
  async getJwtToken(payload) {
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async googleSignIn(googleUser) {
    try {
      const payload = {
        userId: googleUser.id,
        username: googleUser.name,
        nickname: googleUser.nickname,
        imgUrl: googleUser.imgUrl,
      };

      const jwtToken = await this.getJwtToken(payload);

      console.log('sadfsdafsdaf ' + jwtToken);
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

  /**mail로 사용자 조회 */
  async selectGoogleUser(email: string) {
    try {
      const res = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });

      return res;
    } catch (err) {
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

  async kakaoLogin(kakaoLoginDto) {
    try {
      const token = kakaoLoginDto.idToken;
      console.log(token);
      const kakaoResponse = await axios.post(
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(kakaoResponse);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getUser(headers) {
    try {
      //수정 전 유저 정보 가져오기

      const verified = await this.getToken.getToken(headers);
      const user = await this.getUserWithId(verified.userId);
      const res = {
        //비밀번호는 빼고 넘기기
        id: user.id,
        userId: user.userId,
        name: user.name,
        birth: user.birth,
        nickname: user.nickname,
        email: user.email,
        userLoginType: user.userLoginType,
        //이미지 추가 필
      };
      return res;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 정보 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getUserWithId(id) {
    try {
      return this.userRepository.findOne({
        where: {
          id: id,
        },
      });
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 수정 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async updateUser(updateUserDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      if (verified.nickname !== updateUserDto.nickname) {
        //닉네임에 변화가 있으면 중복 검사 실행
        const checkNickname = await this.nicknameCheck(updateUserDto.nickname);
        if (checkNickname.success === false) return checkNickname;
      }
      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(updateUserDto.password, salt);
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({
          name: updateUserDto.name,
          birth: updateUserDto.birth,
          nickname: updateUserDto.nickname,
          password: hashedPw,
          //이미지 추가 필
        })
        .where('id = :id', { id: verified.userId })
        .execute();

      const payload = {
        userId: verified.userId,
        username: updateUserDto.name,
        nickname: updateUserDto.nickname,
        imgUrl: updateUserDto.img,
      };

      const jwtToken = await this.getJwtToken(payload);

      return { success: true, jwtToken };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async getIdWithEmail(email: string) {
    try {
      const res = await this.userRepository.find({
        select: {
          userId: true,
        },
        where: {
          email: email,
        },
      });
      if (res[0]) return { success: true, userId: res[0].userId };
      else return { success: false, msg: '해당 이메일이 없습니다.' };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '이메일로 유저 아이디 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  public hideUserId(userId) {
    const idArray = userId.split('');
    const lastIndex = idArray.length - 1;
    return idArray
      .map((e, i) => {
        if (i === 0 || i === 1 || i === lastIndex) {
          return e;
        } else return '*';
      })
      .join('');
  }

  async getForgottenId(email: string) {
    try {
      const authEmail = await this.emailCodeCheck(email);
      if (authEmail.success === false) return authEmail;

      const res = await this.getIdWithEmail(email);
      return { userId: this.hideUserId(res.userId) };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '분실 유저 아이디 찾기 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async patchForgottenPw(updateForgottenPwDto) {
    try {
      const authEmail = await this.emailCodeCheck(updateForgottenPwDto.email);
      if (authEmail.success === false) return authEmail;

      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(updateForgottenPwDto.password, salt);
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({
          password: hashedPw,
        })
        .where('email = :email', { email: updateForgottenPwDto.email })
        .execute();

      return { success: true };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '분실 유저 비밀번호 패치 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  async checkUserIdWithEmail(checkUserIdDto) {
    try {
      const res = await this.getIdWithEmail(checkUserIdDto.email);
      console.log(res);
      if (res.success === true) {
        if (res.userId === checkUserIdDto.userId) return { success: true };
        else return { success: false, msg: '아이디 불일치' };
      } else return res;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '유저 아이디와 이메일 일치 여부 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  ////userImg 관련
  async s3url() {
    this.logger.log('s3url');
    return {
      ...(await this.getS3Url.s3url()),
      ok: HttpStatus.OK,
    };
  }

  /**
   * db에 있나 확인
   */
  async checkUrl(userId) {
    try {
      const check = await this.userImgRepository.query(`
        select id from "userImg" where "userId" = ${userId}
      `);
      return !!check[0];
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 체크 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * s3url db에 저장
   */
  async insertUrl(url, id) {
    try {
      const userImgData = new UserImgEntity();
      userImgData.imgUrl = url;
      userImgData.user = id;
      await this.userImgRepository.save(userImgData);

      return { success: true, status: HttpStatus.CREATED };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 삽입 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * url 수정
   */
  async updateUrl(updateUrlDto, headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = verified.userId;

      const check = await this.checkUrl(userId);
      if (check) {
        await this.userImgRepository
          .createQueryBuilder()
          .update()
          .set({
            imgUrl: updateUrlDto.url,
          })
          .where('userId = :userId', { userId: userId })
          .execute();
      } else {
        await this.insertUrl(updateUrlDto.url, userId);
      }

      return { success: true, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 수정 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * url 삭제
   */
  async deleteUrl(headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = verified.userId;

      await this.userImgRepository
        .createQueryBuilder()
        .update()
        .set({
          imgUrl: 'noUrl',
        })
        .where('userId = :userId', { userId: userId })
        .execute();

      return { success: true, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'url 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**
   * 마이 페이지 관련
   */
  async myPageUser(headers) {
    try {
      const verified = await this.getToken.getToken(headers);
      const userId = verified.userId;
      const user = await this.getUser(headers);
      const url = await this.getUserImgUrl(userId);
      const userInfo = { ...user, ...url };
      return { userInfo, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 유저 정보 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**내가 작성한 게시판*/
  async myPageBoard(page, headers) {
    try {
      const board = await this.boardService.getMyBoard(page, headers);
      return { board, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 게시판 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**추천한 게시판*/
  async myPageLikedBoard(page, headers) {
    try {
      const board = await this.boardService.getLikedBoard(page, headers);
      return { board, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 추천 게시판 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**내가 작성한 Ebook*/
  async myPageEbook(page, headers) {
    try {
      const ebook = await this.ebookService.getMyEbook(page, headers);
      return { ebook, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 Ebook 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**ebook history 열람*/
  async myPageEbookHistory(page, headers) {
    try {
      const history = await this.ebookService.getEbookHistory(page, headers);
      return { history, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 Ebook history 조회 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }

  /**ebook history 삭제*/
  async myPageEbookHistoryDelete(ebookId, headers) {
    try {
      await this.ebookService.deleteHistory(ebookId, headers);

      return { status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '마이 페이지 Ebook history 삭제 중 에러 발생',
          success: false,
        },
        500,
      );
    }
  }
}
