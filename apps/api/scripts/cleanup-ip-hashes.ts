import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function retentionDays(): number {
  const parsed = Number(process.env.IP_HASH_RETENTION_DAYS ?? 30);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
    throw new Error('IP_HASH_RETENTION_DAYS deve estar entre 1 e 365');
  }

  return parsed;
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
  });
  const prisma = new PrismaClient({ adapter });
  const days = retentionDays();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1_000);

  try {
    const result = await prisma.linkAccess.updateMany({
      where: {
        ipHash: { not: null },
        createdAt: { lt: cutoff },
      },
      data: { ipHash: null },
    });

    process.stdout.write(
      `${JSON.stringify({
        event: 'ip_hash_retention_completed',
        retentionDays: days,
        clearedRecords: result.count,
        cutoff: cutoff.toISOString(),
      })}\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({
      event: 'ip_hash_retention_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })}\n`,
  );
  process.exitCode = 1;
});
