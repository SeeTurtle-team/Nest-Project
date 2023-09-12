import { InjectRepository } from '@nestjs/typeorm';
import { HttpException,HttpCode, HttpStatus, Injectable,UnauthorizedException,Logger} from '@nestjs/common';
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
async verifying(headers):Promise<any>
{
  try{
    const [type, token] = headers.authorization?.split(' ') ?? [];
    console.log(type,token);
    if(!token)
    {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
              secret: process.env.JWT_CONSTANTS,
            });
            console.log(payload,'\npayload');
            const user=await this.userRepository.createQueryBuilder('u').select('ug.userGrade').innerJoin('u.userGrade','ug').where('u.id=:id',{id: payload.userId}).getRawOne();
            return { usergrade:user.ug_userGrade, userId:payload.userId,username:payload.username};
          } catch(err)
          {
            
            throw new UnauthorizedException();
          }
    }
    else
    { console.log(type,token,'?');
        return {usergrade:undefined,userId:null,username:'Anonymous'};
    }}
    catch (err)
    {
      this.logger.error(err);
      throw new HttpException(
        {
          status:HttpStatus.INTERNAL_SERVER_ERROR,
          error:'Qna 인증중 오류발생',
          success:false,
        },HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }
    /**
     * 
     * @param user 
     * @returns object
     */
    /** qna게시판 게시글전체조회
     * 등급따라 차등기능.
     *@param headers
     *@return 
     */ 
    async getAll(page,headers):Promise<object>
    {
      try{
      //   const offset = page.getOffset();
      // const limit = page.getLimit();
      const offset=1;
      const limit=1;
        const user=await this.verifying(headers);
        console.log(user,'\n user');
        let qb,result,count;
        if(user.usergrade===userGrade.Admin)
        {
          console.log('hi');
          qb=await this.qnaRepository.createQueryBuilder('qna').select(['qna.id','qna.title','qna.dateTime','qna.isModified','qna.issecret','qna.userId']).where('qna.isDeleted=:deleted').andWhere('qna.ban=:isbanned').setParameters({'deleted':false,'isbanned':false});
          result=await qb.orderBy('qna.isanswered','ASC').addOrderBy('qna.dateTime').limit(limit).offset(offset).getMany();
          count=await qb.getCount();
        console.log(result,count);
        }
        else if(user.usergrade===userGrade.User)
        {
          qb=await this.qnaRepository.createQueryBuilder('qna').select(['qna.id','qna.title','qna.dateTime','qna.isModified','qna.issecret','qna.userId']).where('qna.isDeleted=:deleted').andWhere('qna.userId=:normalid OR qna.issecret=:normalsecret').andWhere('qna.ban=:isbanned').setParameters({'deleted':false,'isbanned':false,'normalid':user.userId,'normalsecret':false});
          result=await qb.orderBy('qna.userId=:normalid',{'normalid':user.userId}).addOrderBy('qna.dateTime').limit(limit).offset(offset).getMany();
          count=await qb.getCount();
        }
        else
        {
          qb=await this.qnaRepository.createQueryBuilder('qna').select(['qna.id','qna.title','qna.dateTime','qna.isModified','qna.issecret','qna.userId']).where('qna.isDeleted=:deleted').andWhere('qna.issecret=:normalsecret').andWhere('qna.ban=:isbanned').setParameters({'deleted':false,'isbanned':false,'normalsecret':false});
          result=await qb.orderBy('qna.dateTime').limit(limit).offset(offset).getMany();
          count=await qb.getCount();
        }
        return new Page(count,page.pageSize,result);
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
     /** qna게시판 게시글전체조회
     * 등급따라 차등기능.
     *@param createQnaDto,headers
     *@return 
     */ 
    async create(createQnaDto,headers):Promise<object>
    {try
      {
        const verified=await this.verifying(headers);
        let QnaData = new QnaEntity();
        QnaData.title = createQnaDto.title;
        QnaData.contents = createQnaDto.contents;
        QnaData.user = verified.userId;
        QnaData.dateTime = new Date();
        QnaData.isDeleted = false;
        QnaData.isModified = false;
        QnaData.isanswered=false;
        QnaData.ban=false;
        QnaData.username=verified.username;
        if(createQnaDto.issecret)
        {
          QnaData.username='annoymous';
          QnaData.issecret=true;
        }
        await this.qnaRepository.save(QnaData);
        return { success: true,status:HttpStatus.OK};
      }
    catch(err)
    {
      this.logger.error(err);
        throw new HttpException(
          {
            status:HttpStatus.INTERNAL_SERVER_ERROR,
            error:'Qna 생성중 오류발생',
            success:false,
          },HttpStatus.INTERNAL_SERVER_ERROR)
    }

    }
    async getOne(id,headers)
    {

    }
}
