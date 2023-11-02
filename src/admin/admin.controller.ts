
import {Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Logger, Param, Patch, Post, Query, UseGuards,} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {Throttle, ThrottlerModule} from '@nestjs/throttler';
import {Public} from 'src/auth/decorators/public.decorator';
import {PageRequest} from 'src/utils/PageRequest';
import { AdminService } from './admin.service';
@Controller('admin')
@ApiTags('Admin API')
export class AdminController {
    constructor(
        private adminService : AdminService,
    ){}
    private readonly logger = new Logger(AdminController.name);
@ApiOperation({summary: 'Admin의 미승인 계시글 열람'})
  @HttpCode(HttpStatus.OK)
  @Get('/getUncheckedEbookList')
  async getUncheckedEbookList(@Headers() headers,@Query() pageRequest?:PageRequest) {
    this.logger.log('-----GET /admin/getUncheckedList');
    return await this.adminService.getUncheckedEbookList(headers,pageRequest);
  }
}
