import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable,UnauthorizedException,Logger} from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { userGrade } from 'src/Common/userGrade';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { UserEntity } from 'src/entities/user.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import{ Page }from 'src/utils/page';
@Injectable()
export class QnaService 
{private readonly logger = new Logger(QnaService.name);
  constructor(
  @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(QnaEntity)
    private readonly qnaRepository: Repository<QnaEntity>,
    @InjectRepository(QnaCommentEntity)
    private readonly qnaCommentEntity: Repository<QnaCommentEntity>,
    private readonly jwtService: JwtService,
    ){}
     /**인증진행
     *@param headers
     *@return userGrade, as enum
     */ 
async verifying(headers)
{
    const [type, token] = headers.authorization?.split(' ') ?? [];
    if(type === 'Bearer')
    {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
              secret: process.env.JWT_CONSTANTS,
            });
            const user=await this.userRepository.createQueryBuilder('u').select('ug.userGrade').innerJoin('u.userGrade','ug').where('u.id=:id',{id: payload.userId}).getRawOne();
            return { usergrade:user.ug_userGrade, userId:payload.userId,username:payload.userName};
          } catch(err)
          {
            throw new UnauthorizedException();
          }
    }
    else
    {
        return {usergrade:undefined,userId:null,username:'Anonymous'};
    }
    }
    /**
     * 
     * @param user 
     * @returns object
     */
    async getAll_Admin(page,user):Promise<object>
    {
      const offset = page.getOffset();
      const limit = page.getLimit();
      const adminpage=await this.qnaRepository.createQueryBuilder('Admin').where('Admin.isdeleted=:deleted').andWhere('Admin.ban=:isbanned').setParameters({'deleted':false,'isbanned':false}).addOrderBy('Admin.isanswerd','DESC').orderBy('Admin.id').limit(limit).offset(offset).getMany();
      return new Page(3,page.pageSize,adminpage);
    }
    async getAll_User(page,user):Promise<object>
    {
      const offset = page.getOffset();
      const limit = page.getLimit();
      const Userpage=await this.qnaRepository.createQueryBuilder('User').where('User.isdeleted=:deleted').andWhere('User.ban=:isbanned').setParameters({'deleted':false,'isbanned':false}).addOrderBy('User.isanswerd','ASC').orderBy('User.id').limit(limit).offset(offset).getMany();
      return new Page(2,page.pageSize,Userpage);
    }
    async getAll_undefined(page,user):Promise<object>
    {
      return Object;
    }
    /** qna게시판 게시글전체조회
     * 등급따라 차등기능.
     *@param headers
     *@return 
     */ 
    async getAll(page,headers):Promise<object>
    {
      try{
        const user=await this.verifying(headers);
        if(user.usergrade===userGrade.Admin)
        {
          return this.getAll_Admin(page,user);
        }
        else if(user.usergrade===userGrade.User)
        {
          return this.getAll_User(page,user);
        }
        else
        {
          return this.getAll_undefined(page,user);
        }
      }
      catch(err)
      {
        this.logger.error(err);
        throw new HttpException(
          {
            status:HttpStatus.INTERNAL_SERVER_ERROR,
            error:'Qna게시판 조회중 오류발생',
            success:false,
          },HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }
}
