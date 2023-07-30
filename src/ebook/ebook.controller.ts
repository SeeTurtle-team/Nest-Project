import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Logger,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EbookService } from './ebook.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { DeleteEbookDto } from './dto/delete-ebook.dto';

@Public()
@Controller('ebook')
@ApiTags('ebook API')
export class EbookController {
  constructor(private ebookService: EbookService) {}
  private readonly logger = new Logger(EbookController.name);

  @ApiOperation({ summary: 'ebook 전체 조회' })
  @Get()
  async getAll() {
    this.logger.log('-----GET /ebook');
    return await this.ebookService.getAll();
  }

  @ApiOperation({ summary: 'ebook 열람' })
  @Get('/:id')
  async getOne(@Param('id') id: number) {
    this.logger.log('-----GET /ebook/:id');
    return await this.ebookService.getOne(id);
  }

  @ApiOperation({ summary: 'ebook 작성' })
  @Post()
  async create(@Body() createEbookDto: CreateEbookDto, @Headers() headers) {
    this.logger.log('-----POST /ebook');
    return await this.ebookService.create(createEbookDto, headers);
  }

  @ApiOperation({ summary: 'ebook 수정 전 가져오기' })
  @Get('/getupdate/:id')
  async getUpdate(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----GET /ebook/getupdate');
    return await this.ebookService.getUpdate(id, headers);
  }

  @ApiOperation({ summary: 'ebook 수정' })
  @Patch()
  async update(@Body() updateEbookDto: UpdateEbookDto, @Headers() headers) {
    this.logger.log('-----PATCH /ebook');
    return await this.ebookService.update(updateEbookDto, headers);
  }

  @ApiOperation({ summary: 'ebook 삭제' })
  @Delete()
  async delete(@Body() deleteEbookDto: DeleteEbookDto, @Headers() headers) {
    this.logger.log('-----DELETE /ebook');
    return await this.ebookService.delete(deleteEbookDto, headers);
  }
}
