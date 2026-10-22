import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator
  extends HealthIndicator
  implements OnModuleDestroy
{
  private readonly client: Redis;

  constructor(config: ConfigService) {
    super();
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      lazyConnect: true,
      connectTimeout: 1_000,
      commandTimeout: 1_000,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
  }

  async ping(key = 'redis'): Promise<HealthIndicatorResult> {
    try {
      if (this.client.status === 'wait' || this.client.status === 'end') {
        await this.client.connect();
      }

      const response = await this.client.ping();

      if (response !== 'PONG') {
        throw new Error('Unexpected Redis PING response');
      }

      return this.getStatus(key, true);
    } catch {
      throw new HealthCheckError(
        'Redis indisponível',
        this.getStatus(key, false),
      );
    }
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
