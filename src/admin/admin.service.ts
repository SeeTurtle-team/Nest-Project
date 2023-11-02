import { ConsoleLogger, HttpCode, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { EbookEntity } from 'src/entities/ebook.entity';
import { userGrade } from 'src/Common/userGrade';
import { GetToken } from 'src/utils/GetToken';
import { PageRequest } from 'src/utils/PageRequest';
import { Page } from 'src/utils/Page';
@Injectable()
export class AdminService {
    constructor(private readonly dataSource: DataSource,private readonly getToken:GetToken)
    {}
    private readonly logger = new Logger(AdminService.name);
    async checkIsAdmin(userId: number): Promise<boolean> {
        try {
            const isAdmin =await this.dataSource.getRepository(UserEntity).createQueryBuilder('user').innerJoin("user.userGrade","userGrade").select("userGrade.userGrade","uG").where("user.id=:id",{id:userId}).getRawOne();
            return isAdmin['uG']===userGrade.Admin?true:false;
    }
        catch (err) {
            this.logger.error(err);
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'checkisAdmin에서 에러발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
            
        }

    }
    
    async getUncheckedEbookList(headers:Headers,pageRequest?:PageRequest):Promise<any>
    { try{const verified = await this.getToken.getToken(headers);
        const isAdmin = await this.checkIsAdmin(verified.userId);
        let offset=10;
        let limit=10;
        let pageSize=10;
        if(pageRequest){
        offset = pageRequest.getOffset();
        limit = pageRequest.getLimit();
        pageSize=pageRequest.pageSize;
    }
        if(isAdmin)
        {
            const page=await this.dataSource.getRepository(EbookEntity).createQueryBuilder('ebook').innerJoinAndSelect("ebook.boardCategory","boardCategory").where("ebook.adminCheck=:bool",{bool:false}).offset(offset).limit(limit).orderBy("ebook.dateTime","DESC").getManyAndCount();
            return new Page(page[1],pageSize,page[0]);
        }
        else
        {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'getUncheckedList에 일반유저접근',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        }
        catch (err) 
        {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'getUncheckedList에서 오류발생',
                    success: false,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
