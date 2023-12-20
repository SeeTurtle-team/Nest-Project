import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      Store: redisStore,
      host: 'redis-container',
      port: 6379,
      ttl: 60000, // ms
      max: 15, // maximum number of items in cache
      inGlobla: true,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
