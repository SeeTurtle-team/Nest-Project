import { Module } from '@nestjs/common';
import { EbookController } from './ebook.controller';
import { EbookService } from './ebook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbookEntity } from 'src/entities/ebook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EbookEntity])],
  controllers: [EbookController],
  providers: [EbookService],
})
export class EbookModule {}
