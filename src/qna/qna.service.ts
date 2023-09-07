import { InjectRepository } from '@nestjs/typeorm';
import { Injectable,UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserGradeEntity } from 'src/entities/userGrade.Entity';
import { userGrade } from 'src/Common/userGrade';
import { GetToken } from 'src/utils/GetToken';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { UserEntity } from 'src/entities/user.entity';
@Injectable()
export class QnaService 
{constructor(
  @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(QnaEntity)
    private readonly qnaRepository: Repository<QnaEntity>,
    private readonly jwtService: JwtService,
    ){}
    /*const payload = {
        userId: user.id,
        username: user.name,
        nickname: user.nickname,
        imgUrl: user.img,
      };
      Select "userGrade" from public."userGrade" Where "id"=2
      */ 
async verifying(headers){
    const [type, token] = headers.authorization?.split(' ') ?? [];
    console.log(headers,type,token);
    if(type === 'Bearer')
    {//인증진행.
        try {
            const payload = await this.jwtService.verifyAsync(token, {
              secret: process.env.JWT_CONSTANTS,
            });
            //const user=await this.userRepository.createQueryBuilder('user').innerJoinAndSelect('user.userGrade','userGradeEntity.id').getRawMany();innerjoin으로합성한 전체테이블
            console.log(payload);
            // const user=await this.userRepository.createQueryBuilder('user').innerJoinAndSelect('user.userGrade','userGradeEntity.id').where('user.id=:id',{id: payload.userId}).getOne();
            // console.log(user,user.userGrade,user.userGrade.userGrade,"userprint\n");//접근가능
            const user=await this.userRepository.createQueryBuilder('user').innerJoin('user.userGrade','userGrade.id').select('"userGradeEntity"."userGrade"').where('user.id=:id',{id: payload.userId}).getRawMany();
            console.log(user);
            return true;
          } catch(err)
          {
            console.log(err);
            throw new UnauthorizedException();
          }
    }
    else
    {
        return undefined;
    }
    
    }
    async getAll(headers)
    {
        console.log(this.verifying(headers));
    }
}
