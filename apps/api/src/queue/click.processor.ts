import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LinksService } from "src/links/links.service";
import { CLICK_QUEUE } from "./queue.constants";

interface JobData {
	eventId: string;
	linkId: string;
	ip: string;
	userAgent: string;
	referer: string;
}

@Processor(CLICK_QUEUE)
export class ClickProcessor extends WorkerHost {
	constructor(private readonly linksService: LinksService) {
		super();
	}

	async process(job: Job<JobData>) {
		await this.linksService.registerAccess(job.data.linkId, job.data);
	}
}
