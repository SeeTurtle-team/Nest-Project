import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailCheckCodeEntity } from 'src/entities/emailCheckCode.entity';
import { AuthService } from 'src/auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GetToken } from 'src/utils/GetToken';
import { UserImgEntity } from 'src/entities/userImg.entity';
import { GetS3Url } from 'src/utils/GetS3Url';
import { BoardModule } from 'src/board/board.module';
import { EbookModule } from 'src/ebook/ebook.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    BoardModule,
    EbookModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([UserEntity, EmailCheckCodeEntity, UserImgEntity]),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService, GetToken, GetS3Url],
  exports: [UserService],
})
export class UserModule {}
