import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { catchError, delay, Observable, retry, tap, throwError, timeout } from "rxjs";
import { TIMEOUT_METADATA_KEY } from "../auth/decorators/timeout-decorator";

/**https://velog.io/@from_numpy/NestJS-Request-Timeout-handling-with-Interceptor-Rxjs */
@Injectable()
export class StaticTimeoutInterceptor implements NestInterceptor {
    
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
      
      let timeoutValue = this.reflector.get<number>(TIMEOUT_METADATA_KEY, context.getHandler());
      // retry-options
      const retryCount = 3;
      
      console.log("timeoutValue : " + timeoutValue)

      if(timeoutValue === undefined){
        timeoutValue = 5000;
      }
      
      return next.handle().pipe(
        timeout(timeoutValue),
        retry(retryCount),
        catchError((error) => {
          console.log("DASfasfd")  
          console.log(error)
          if (error.name === 'TimeoutError') {
            console.log(`Timeout of ${timeoutValue}ms exceeded`);
            return throwError(() => new HttpException('Request Timeout', HttpStatus.REQUEST_TIMEOUT));
          } else {
            return throwError(() => error)
          }
        }),
        tap(() => {
          console.log('Request completed');
        }),
      );
  }
}