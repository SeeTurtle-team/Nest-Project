import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailCheckCodeEntity } from 'src/entities/emailCheckCode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, EmailCheckCodeEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
