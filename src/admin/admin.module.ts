import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { GetToken } from 'src/utils/GetToken';
@Module({
  imports:[],
  controllers : [AdminController],
  providers: [AdminService,GetToken]
})
export class AdminModule {}
