import { InjectRepository } from '@nestjs/typeorm';
import { Injectable,UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserGradeEntity } from 'src/entities/userGrade.Entity';
import { userGrade } from 'src/Common/userGrade';
import { GetToken } from 'src/utils/GetToken';
@Injectable()
export class QnaService 
{constructor(
    @InjectRepository(UserGradeEntity)
    private readonly userGradeRepository: Repository<UserGradeEntity>,
    private readonly jwtService: JwtService,private readonly userService: UserService,
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
            const user=await this.userService.findOne(payload.user);
            const usergrade=await this.userGradeRepository.query(`select "userGrade" from public."userGrade" Where "id"=${user.userGrade}`);
            console.log(usergrade);
            return usergrade;
          } catch 
          {
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
