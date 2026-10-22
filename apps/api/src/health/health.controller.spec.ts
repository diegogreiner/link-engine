import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type {
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import type { PrismaService } from 'src/prisma/service';
import { HealthController } from './health.controller';
import type { RedisHealthIndicator } from './redis-health.indicator';

describe('HealthController', () => {
  let health: { check: jest.Mock<HealthCheckService['check']> };
  let prismaHealth: {
    pingCheck: jest.Mock<PrismaHealthIndicator['pingCheck']>;
  };
  let redisHealth: { ping: jest.Mock<RedisHealthIndicator['ping']> };
  let controller: HealthController;

  beforeEach(() => {
    health = { check: jest.fn<HealthCheckService['check']>() };
    prismaHealth = {
      pingCheck: jest.fn<PrismaHealthIndicator['pingCheck']>(),
    };
    redisHealth = {
      ping: jest.fn<RedisHealthIndicator['ping']>(),
    };
    controller = new HealthController(
      health as unknown as HealthCheckService,
      prismaHealth as unknown as PrismaHealthIndicator,
      {} as PrismaService,
      redisHealth as unknown as RedisHealthIndicator,
    );
  });

  it('returns a dependency-free liveness response', () => {
    expect(controller.live()).toEqual({ status: 'ok' });
    expect(health.check).not.toHaveBeenCalled();
  });

  it('registers PostgreSQL and Redis readiness indicators', () => {
    health.check.mockReturnValue(Promise.resolve({ status: 'ok' }) as never);

    controller.ready();

    const indicators = health.check.mock.calls[0][0];
    expect(indicators).toHaveLength(2);
  });
});
