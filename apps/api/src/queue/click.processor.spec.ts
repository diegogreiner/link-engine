import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@nestjs/bullmq', () => ({
  Processor: () => (target: unknown) => target,
  WorkerHost: class {},
}));
jest.mock('nanoid', () => ({ nanoid: jest.fn() }));

import type { Job } from 'bullmq';
import type { AnalyticsCacheService } from 'src/analytics/analytics-cache.service';
import type { LinksService } from 'src/links/links.service';
import { ClickProcessor } from './click.processor';

type ClickJob = Parameters<ClickProcessor['process']>[0];

const jobData = {
  eventId: 'event-1',
  linkId: 'link-1',
  ip: '203.0.113.10',
  userAgent: 'Mozilla/5.0',
  referer: 'https://google.com',
  userId: 'user-1',
};

describe('ClickProcessor', () => {
  let linksService: {
    registerAccess: jest.Mock<LinksService['registerAccess']>;
  };
  let analyticsCache: {
    invalidateAnalyticsCache: jest.Mock<
      AnalyticsCacheService['invalidateAnalyticsCache']
    >;
  };
  let processor: ClickProcessor;
  let job: ClickJob;

  beforeEach(() => {
    linksService = {
      registerAccess: jest.fn<LinksService['registerAccess']>(),
    };
    analyticsCache = {
      invalidateAnalyticsCache:
        jest.fn<AnalyticsCacheService['invalidateAnalyticsCache']>(),
    };
    processor = new ClickProcessor(
      linksService as unknown as LinksService,
      analyticsCache as unknown as AnalyticsCacheService,
    );
    job = { data: jobData } as unknown as Job<typeof jobData>;
  });

  // Tradução: deve encaminhar o ID do link e os dados do job ao registrar o acesso.
  it('should forward the link ID and job data when registering the access', async () => {
    // Mocks
    linksService.registerAccess.mockResolvedValue(false);

    // Chamada
    await processor.process(job);

    // Resultados
    expect(linksService.registerAccess).toHaveBeenCalledTimes(1);
    expect(linksService.registerAccess).toHaveBeenCalledWith('link-1', jobData);
  });

  // Tradução: deve invalidar o cache de analytics quando um novo acesso for criado.
  it('should invalidate analytics when a new access is created', async () => {
    // Mocks
    linksService.registerAccess.mockResolvedValue(true);

    // Chamada
    await processor.process(job);

    // Resultados
    expect(analyticsCache.invalidateAnalyticsCache).toHaveBeenCalledTimes(1);
    expect(analyticsCache.invalidateAnalyticsCache).toHaveBeenCalledWith(
      'user-1',
      'link-1',
    );
  });

  // Tradução: não deve invalidar o cache de analytics quando o evento estiver duplicado.
  it('should not invalidate analytics when the event is duplicated', async () => {
    // Mocks
    linksService.registerAccess.mockResolvedValue(false);

    // Chamada
    await processor.process(job);

    // Resultados
    expect(analyticsCache.invalidateAnalyticsCache).not.toHaveBeenCalled();
  });

  // Tradução: deve propagar erros para que o BullMQ possa tentar o job novamente.
  it('should propagate errors so BullMQ can retry the job', async () => {
    // Mocks
    const error = new Error('database unavailable');
    linksService.registerAccess.mockRejectedValue(error);

    // Chamada
    const promise = processor.process(job);

    // Resultados
    await expect(promise).rejects.toBe(error);
    expect(analyticsCache.invalidateAnalyticsCache).not.toHaveBeenCalled();
  });
});
