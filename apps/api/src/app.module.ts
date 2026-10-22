import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { LinksModule } from './links/links.module';
import { createLoggerConfig } from './observability/logger.config';
import { PrismaModule } from './prisma/module';
import { PrivacyModule } from './privacy/privacy.module';
import { RedirectModule } from './redirect/redirect.module';
import basicAuth from 'express-basic-auth';

import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { RateLimitGuard, ResilientThrottlerStorage } from './throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SentryModule.forRoot(),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createLoggerConfig,
    }),
    PrivacyModule,
    AuthModule,
    LinksModule,
    PrismaModule,
    RedirectModule,
    AnalyticsModule,
    HealthModule,
    BullBoardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('BULL_BOARD_USER');
        const password = config.get<string>('BULL_BOARD_PASSWORD');

        if (!user || !password) {
          throw new Error(
            'BULL_BOARD_USER e BULL_BOARD_PASSWORD são obrigatórios',
          );
        }

        return {
          route: '/admin/queues',
          adapter: ExpressAdapter,
          middleware: basicAuth({
            challenge: true,
            users: {
              [user]: password,
            },
          }),
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('REDIS_URL');

        const redisStorage = new ThrottlerStorageRedisService(redisUrl, {
          connectTimeout: 1_000,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
        });

        return {
          throttlers: [
            {
              name: 'default',
              ttl: minutes(1),
              limit: 100,
            },
          ],
          storage: new ResilientThrottlerStorage(redisStorage),
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
