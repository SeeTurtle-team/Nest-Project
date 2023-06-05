import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BoardEntity } from './entities/board.entity';
import { BoardCategoryEntity } from './entities/boardCategory.entity';
import { BoardCommentEntity } from './entities/boardComment.entity';
import { EbookEntity } from './entities/ebook.entity';
import { EbookCommentEntity } from './entities/ebookComment.entity';
import { EbookFileEntity } from './entities/ebookFile.entity';
import { EbookRatingEntity } from './entities/ebookRating.entity';
import { ImgEntity } from './entities/img.entity';
import { JobEntity } from './entities/job.entity';
import { NotifyEntity } from './entities/notify.entity';
import { SmallSubjectEntity } from './entities/smallSubject.entity';
import { SmallTalkEntity } from './entities/smallTalk.entity';
import { SubscribeEntity } from './entities/subscribe.entity';
import { UserImgEntity } from './entities/userImg.entity';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        BoardEntity,
        BoardCategoryEntity,
        BoardCommentEntity,
        EbookEntity,
        EbookCommentEntity,
        EbookFileEntity,
        EbookRatingEntity,
        ImgEntity,
        JobEntity,
        NotifyEntity,
        SmallSubjectEntity,
        SmallTalkEntity,
        SubscribeEntity,
        UserEntity,
        UserImgEntity,
      ],
      synchronize: false,
      autoLoadEntities: true,
      logging: true,
    }),
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
