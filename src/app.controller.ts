import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'getHello' })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Public()
  // @ApiOperation({ summary: 'cache-test'})
  // @Get('/cache')
  // async getCache() : Promise<string>{
  //   const savedTime = await this.cacheManager.get('time');
  //   const test = await this.cacheManager.get('test');
  //   console.log(test);

  //   if(savedTime){
  //     console.log('cache!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  //     return "saved time : " + savedTime;
  //   }

  //   const now = new Date().getTime();

  //   await this.cacheManager.set('time',now); //ttl은 ms 단위
  //   return "save new time : "+now;
  // }
}
