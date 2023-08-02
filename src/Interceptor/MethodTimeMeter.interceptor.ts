import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";

//https://velog.io/@atesi/Nestjs-Interceptor
@Injectable()
export class MethodTimeMeterInterceptor implements NestInterceptor{
    constructor(private readonly reflector: Reflector) {}
   
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const start = Date.now();
        return next.handle().pipe(
            tap(async () => {
                const end = Date.now();
                const time = end - start;
                const logger = new Logger();
                logger.debug(`function executed in ${time} ms. `)
            })
        )
    }
}