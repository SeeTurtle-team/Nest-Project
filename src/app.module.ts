import { Logger, MiddlewareConsumer, Module, NestModule, } from '@nestjs/common';
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
import { BoardRecommendEntity } from './entities/boardRecommend.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { BoardNotifyEntity } from './entities/boardNotify.entity';
import { UserGradeEntity } from './entities/userGrade.Entity';
import { UserModule } from './user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { EbookModule } from './ebook/ebook.module';
import { SmallTalkModule } from './small-talk/small-talk.module';
import { StaticTimeoutInterceptor } from './Interceptor/static-timeout-handle.interceptor';
import { MethodTimeMeterInterceptor } from './Interceptor/MethodTimeMeter.interceptor';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';

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
        BoardRecommendEntity,
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
        BoardNotifyEntity,
        UserGradeEntity,
      ],
      synchronize: false,
      autoLoadEntities: true,
      logging: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      },
    }),

    //동일한 IP의 10개 요청이 1분 안에 단일 엔드포인트로 이루어질 수 있음을 의미
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }), //https://github.com/nestjs/throttler

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.naver.com',
          port: 465,
          auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PW,
          },
        },
        defaults: {
          from: '"no-reply" <email address>',
        },
        preview: true,
      }),
    }),

    
    BoardModule,
    UserModule,
    AuthModule,
    EventModule,
    EbookModule,
    SmallTalkModule,
    AdminModule,
  ],

  controllers: [AppController, AdminController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MethodTimeMeterInterceptor,
     
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: StaticTimeoutInterceptor,
     
    },
    
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    Logger,
  
   
  ],

  
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); //그냥 인터셉트 방식은 라우터 헨들러를 지나야되서 잘못된 요청은 로그가 찍히지 않으므로 모든 요청에 대한 기록을 하는 미들웨어 방식
    //모든 라우트에 로거를 적용
  }
}
