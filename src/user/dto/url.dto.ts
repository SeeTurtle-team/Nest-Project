import { IsString } from 'class-validator';

export class UrlDto {
  @IsString()
  readonly url: string;
}
