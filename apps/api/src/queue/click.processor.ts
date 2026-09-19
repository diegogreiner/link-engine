import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { AnalyticsCacheService } from "src/analytics/analytics-cache.service";
import { LinksService } from "src/links/links.service";
import { CLICK_QUEUE } from "./queue.constants";

interface JobData {
	eventId: string;
	linkId: string;
	ip: string;
	userAgent: string;
	referer: string;
	userId: string;
}

@Processor(CLICK_QUEUE)
export class ClickProcessor extends WorkerHost {
	constructor(
		private readonly linksService: LinksService,
		private readonly analyticsCache: AnalyticsCacheService,
	) {
		super();
	}

	async process(job: Job<JobData>) {
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
	}
}
