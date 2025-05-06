import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.WEBSITE_PORT || 3000;

  app.enableCors();
  app.use(helmet());

  if (process.env.NODE_ENV === 'production') {
    app.use(
      rateLimit({
        max: 10000,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, Please try again in an hour!',
      }),
    );
  }

  app.use(compression());
  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}
bootstrap();
