import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetToken } from 'src/utils/GetToken';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import { UserService } from 'src/user/user.service';
import { UserGradeEntity } from 'src/entities/userGrade.Entity';
import { UserEntity } from 'src/entities/user.entity';
import { EmailCheckCodeEntity } from 'src/entities/emailCheckCode.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
@Module({imports: [TypeOrmModule.forFeature([QnaEntity,UserEntity]),
    ],
    controllers: [QnaController],
    providers: [QnaService],})
export class QnaModule {}
