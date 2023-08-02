import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { winstonLogger } from './utils/winston.config';
import { MethodTimeMeterInterceptor } from './Interceptor/MethodTimeMeter.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true, logger:winstonLogger });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    
    // rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: 100, // limit each IP to 100 requests per windowMs
    // }),

    app.use(helmet());
    app.use(helmet.contentSecurityPolicy());
    app.use(helmet.crossOriginEmbedderPolicy());
    app.use(helmet.crossOriginOpenerPolicy());
    app.use(helmet.crossOriginResourcePolicy());
    app.use(helmet.dnsPrefetchControl());
    //app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
    //https://lts0606.tistory.com/627

    //cruf 적용 예정

    // app.use(
    //   rateLimit({
    //     windowMs: 15 * 60 * 1000, // 15 minutes
    //     max: 100, // limit each IP to 100 requests per windowMs
    //   }),
    // );

    const config = new DocumentBuilder()
      .setTitle('nest server API')
      .setDescription('nest team project')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(5000);
}
bootstrap();
//test
