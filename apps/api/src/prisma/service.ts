import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      max: positiveInteger(configService.get<string>('DATABASE_POOL_MAX'), 5),
      connectionTimeoutMillis: positiveInteger(
        configService.get<string>('DATABASE_CONNECTION_TIMEOUT_MS'),
        5_000,
      ),
      idleTimeoutMillis: positiveInteger(
        configService.get<string>('DATABASE_IDLE_TIMEOUT_MS'),
        30_000,
      ),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
