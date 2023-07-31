import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, delay, Observable, retry, tap, throwError, timeout } from "rxjs";
import * as osUtils from "os-utils";


/**https://velog.io/@from_numpy/NestJS-Request-Timeout-handling-with-Interceptor-Rxjs */
@Injectable()
export class DynamicTimeoutInterceptor implements NestInterceptor {
 
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
      const maxTimeout = 3000; // 최대 timeout 설정
      const minTimeout = 1000; // 최소 timeout 설정
	  
      // CPU 사용률 계산
      const cpuUsage: number = await new Promise((resolve) => {
        osUtils.cpuUsage((value) => {
          resolve(value);
        });
      });

      const memoryUsage = 1 - osUtils.freememPercentage(); // 메모리 사용률 계산

      // timeout 값 계산하기
      const timeoutValue = maxTimeout - Math.round((maxTimeout - minTimeout) * ((cpuUsage + memoryUsage) / 2));

       // retry-options
      const retryCount = 3;
  
      return next.handle().pipe(
        timeout(timeoutValue),
        retry(retryCount),     
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            console.log(`Timeout of ${maxTimeout}ms exceeded`);
            return throwError(() => new HttpException('Request Timeout', HttpStatus.REQUEST_TIMEOUT));
          } else {
            return throwError(() => error)
          }
        }),
        tap(() => {
          console.log(`Request completed + ${timeoutValue}ms`);
        }),
      );
  }
}