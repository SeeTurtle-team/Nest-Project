import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { GetToken } from 'src/utils/GetToken';
import { UserEntity } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbookEntity } from 'src/entities/ebook.entity';
@Module({
  imports:[TypeOrmModule.forFeature([UserEntity,EbookEntity])],
  controllers : [AdminController],
  providers: [AdminService,GetToken]
})
export class AdminModule {}
