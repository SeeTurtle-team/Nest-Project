import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { QnaEntity } from 'src/entities/qna/qna.entity';
import { QnaCommentEntity } from 'src/entities/qna/qnacomment.entity';
import { UserEntity } from 'src/entities/user.entity';
import { GetToken } from 'src/utils/GetToken';
import { GetSearchSql } from 'src/utils/GetSearchSql';
import { QnaCommentService } from './qnaComment.service';
@Module({imports: [TypeOrmModule.forFeature([QnaEntity,UserEntity,QnaCommentEntity]),
    ],
    controllers: [QnaController],
    providers: [QnaService,GetToken,GetSearchSql,QnaCommentService],
}
    )

export class QnaModule {}
