import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Job } from 'bullmq';
import { AnalyticsCacheService } from 'src/analytics/analytics-cache.service';
import { LinksService } from 'src/links/links.service';
import { CLICK_QUEUE } from './queue.constants';

interface JobData {
  eventId: string;
  linkId: string;
  ipHash: string | null;
  country: string | null;
  city: string | null;
  userAgent: string;
  referer: string;
  userId: string;
}

@Processor(CLICK_QUEUE)
export class ClickProcessor extends WorkerHost {
  private readonly logger = new Logger(ClickProcessor.name);

  constructor(
    private readonly linksService: LinksService,
    private readonly analyticsCache: AnalyticsCacheService,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    try {
      const created = await this.linksService.registerAccess(
        job.data.linkId,
        job.data,
      );

      if (created) {
        await this.analyticsCache.invalidateAnalyticsCache(
          job.data.userId,
          job.data.linkId,
        );
      }
    } catch (error) {
      const attempts = job.opts.attempts ?? 1;

      this.logger.error(
        `Falha ao processar clique ${job.data.eventId} (tentativa ${job.attemptsMade + 1}/${attempts})`,
        error instanceof Error ? error.stack : undefined,
      );

      if (job.attemptsMade + 1 >= attempts) {
        Sentry.withScope((scope) => {
          scope.setTags({ queue: CLICK_QUEUE, job: job.name });
          scope.setContext('click', {
            eventId: job.data.eventId,
            linkId: job.data.linkId,
          });
          Sentry.captureException(error);
        });
      }

      throw error;
    }
  }
}
