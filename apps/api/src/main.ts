import './instrument';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { createCorsOptions } from './config/cors';
import { setupSwagger } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const configuredTrustProxyHops = Number(
    configService.get<string>('TRUST_PROXY_HOPS') ?? 1,
  );
  const trustProxyHops =
    Number.isInteger(configuredTrustProxyHops) && configuredTrustProxyHops > 0
      ? configuredTrustProxyHops
      : 1;

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.set(
    'trust proxy',
    configService.get<string>('NODE_ENV') === 'production'
      ? trustProxyHops
      : false,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(createCorsOptions(configService));

  setupSwagger(app);

  const port = configService.get<string>('PORT') ?? 3000;

  await app.listen(port);
}

bootstrap();
