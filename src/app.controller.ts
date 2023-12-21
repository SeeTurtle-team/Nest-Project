import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  cacheManager: any;
  constructor(private readonly appService: AppService,private readonly redisService: RedisService,) {}

  @ApiOperation({ summary: 'getHello' })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @ApiOperation({ summary: 'cache-test'})
  @Get('/cache')
  async getCache() : Promise<string>{
    const savedTime = await this.redisService.get('time');
    const test = await this.redisService.get('test');
    console.log(test);

    if(savedTime){
      console.log('cache!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      return "saved time : " + savedTime;
    }

    const now = new Date().getTime();

    await this.redisService.set('time',now); //ttl은 ms 단위
    return "save new time : "+now;
  }
  
  @Public()
  @ApiOperation({ summary: 'cache-test'})
  @Get('/test')
  async testCache() : Promise<string>{
    const savedTime = await this.redisService.get('test');
    if(savedTime){
      console.log('cache!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      return "saved time : " + test;
    }


    await this.redisService.set('time','????'); 
    return "save new time : "+'????';
  }
}
