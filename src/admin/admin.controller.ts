
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {Throttle, ThrottlerModule} from '@nestjs/throttler';
import {Public} from 'src/auth/decorators/public.decorator';
import {PageRequest} from 'src/utils/PageRequest';

import {AdminService} from './admin.service';
import {accepctedEbookListDto,rejectedEbookListDto} from './dto/CheckedEbookList.dto';

@Controller('admin')
@ApiTags('Admin API')
export class AdminController {
  constructor(
      private adminService: AdminService,
  ) {}
  private readonly logger = new Logger(AdminController.name);
  @ApiOperation({summary : 'Admin의 미승인 게시글 열람'})
  @HttpCode(HttpStatus.OK)
  @Get('/getUncheckedEbookList')
  async getUncheckedEbookList(@Headers() headers,
                              @Query() pageRequest?: PageRequest) {
    this.logger.log('-----GET /admin/getUncheckedList');
    return await this.adminService.getUncheckedEbookList(headers, pageRequest);
  }
  @ApiOperation({summary : 'Admin의 미승인 게시글 승인'})
  @HttpCode(HttpStatus.OK)
  @Post('/accepctEbookList')
  async accepctEbookList(@Headers() headers,
                         @Body() ebookList: accepctedEbookListDto) {
    this.logger.log('-----POST /admin/checkedList');
    return await this.adminService.accepctEbookList(headers, ebookList);
  }
  @ApiOperation({summary : 'Admin의 미승인 게시글 반려'})
  @HttpCode(HttpStatus.OK)
  @Post('/rejectEbookList')
  async rejectEbookList(@Headers() headers,
                         @Body() ebookList: rejectedEbookListDto) {
    this.logger.log('-----POST /admin/checkedList');
    return await this.adminService.rejectEbookList(headers, ebookList);
  }
}
