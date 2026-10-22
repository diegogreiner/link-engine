import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from 'src/prisma/service';
import { RedisHealthIndicator } from './redis-health.indicator';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Verificar se o processo da API está ativo' })
  @ApiOkResponse({ description: 'Processo ativo' })
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Verificar PostgreSQL e Redis' })
  @ApiOkResponse({ description: 'Dependências disponíveis' })
  ready() {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck('postgresql', this.prisma, {
          timeout: 1_000,
        }),
      () => this.redisHealth.ping(),
    ]);
  }
}
