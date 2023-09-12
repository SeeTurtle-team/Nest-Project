import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import { UserEntity } from 'src/entities/user.entity';
@Module({imports: [TypeOrmModule.forFeature([QnaEntity,UserEntity,QnaCommentEntity]),
    ],
    controllers: [QnaController],
    providers: [QnaService],})
export class QnaModule {}
