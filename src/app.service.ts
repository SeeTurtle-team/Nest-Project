import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('this is the service bro!');
    return 'Hello World!!!';
  }
}
