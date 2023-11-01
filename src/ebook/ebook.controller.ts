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
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EbookService } from './ebook.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateEbookDto } from './dto/create-ebook.dto';
import { UpdateEbookDto } from './dto/update-ebook.dto';
import { DeleteEbookDto } from './dto/delete-ebook.dto';
import { StarRateDto } from './dto/starRate-ebook.dto';
import { CreateSeriesDto } from './dto/create-series.dto';
import { PageRequest } from 'src/utils/PageRequest';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { DeleteSeriesDto } from './dto/delete-series.dto';
import { InsertUrlDto } from './dto/insert-url.dto';
import { DeleteUrlDto } from './dto/delete-url.dto';

@Public()
@Controller('ebook')
@ApiTags('ebook API')
export class EbookController {
  constructor(private ebookService: EbookService) {}
  private readonly logger = new Logger(EbookController.name);

  @ApiOperation({ summary: 'ebook 최신순 전체 조회' })
  @Get()
  async getAll(@Query() page: PageRequest) {
    this.logger.log('-----GET /ebook');
    return await this.ebookService.getAll(page);
  }

  @ApiOperation({ summary: 'ebook 열람' })
  @Get('/one/:id')
  async getOne(@Param('id') id: number, @Headers() headers) {
    this.logger.log('-----GET /ebook/one/:id');
    return await this.ebookService.getOne(id, headers, 1);
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

  @ApiOperation({ summary: '별점 부여' })
  @Post('/starRating')
  async starRate(@Body() starRateDto: StarRateDto, @Headers() headers) {
    this.logger.log('-----POST /ebook/starRating');
    return await this.ebookService.starRate(starRateDto, headers);
  }

  @ApiOperation({ summary: '별점 순으로 ebook 조회' })
  @HttpCode(HttpStatus.OK)
  @Get('/starRating')
  async getEbookOrderByStarRating(@Query() page: PageRequest) {
    this.logger.log('-----GET /ebook/starRating');
    return await this.ebookService.getEbookOrderByStarRating(page);
  }

  //series 관련
  @ApiOperation({ summary: '본인 시리즈 조회' })
  @Get('/series')
  async getSeries(@Headers() headers) {
    this.logger.log('-----GET /ebook/series');
    return await this.ebookService.getSeries(headers);
  }

  @ApiOperation({ summary: '시리즈 생성' })
  @Post('/series')
  async createSeries(
    @Body() createSeriesDto: CreateSeriesDto,
    @Headers() headers,
  ) {
    this.logger.log('----POST /ebook/series');
    return await this.ebookService.createSeries(createSeriesDto, headers);
  }

  @ApiOperation({ summary: '시리즈 수정' })
  @Patch('/series')
  async updateSeries(
    @Body() updateSeriesDto: UpdateSeriesDto,
    @Headers() headers,
  ) {
    this.logger.log('-----Patch /ebook/series');
    return await this.ebookService.updateSeries(updateSeriesDto, headers);
  }

  @ApiOperation({ summary: '시리즈 삭제' })
  @Delete('/series')
  async deleteSeries(
    @Body() deleteSeriesDto: DeleteSeriesDto,
    @Headers() headers,
  ) {
    this.logger.log('-----Delete /ebook/series');
    return await this.ebookService.deleteSeries(deleteSeriesDto, headers);
  }

  //s3url
  @ApiOperation({ summary: 'Get S3 presigned url' })
  @Get('/s3url')
  async s3url() {
    this.logger.log('-----GET /ebook/s3url');
    return await this.ebookService.s3url();
  }

  @ApiOperation({ summary: 'url db에 저장' })
  @Post('/url')
  async insertUrl(@Body() insertUrlDto: InsertUrlDto, @Headers() headers) {
    this.logger.log('-----POST /ebook/url');
    return await this.ebookService.insertUrl(insertUrlDto, headers);
  }

  @ApiOperation({ summary: 'url 수정' })
  @Patch('/url')
  async updateUrl(@Body() updateUrlDto: InsertUrlDto, @Headers() headers) {
    this.logger.log('-----PATCH /ebook/url');
    return await this.ebookService.updateUrl(updateUrlDto, headers);
  }

  @ApiOperation({ summary: 'url 삭제' })
  @Delete('/url')
  async deleteUrl(@Body() deleteUrlDto: DeleteUrlDto, @Headers() headers) {
    this.logger.log('-----DELETE /ebook/url');
    return await this.ebookService.deleteUrl(deleteUrlDto, headers);
  }
}
