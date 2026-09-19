import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AnalyticsModule } from "src/analytics/analytics.module";
import { LinksModule } from "src/links/links.module";
import { ClickProcessor } from "./click.processor";
import { CLICK_QUEUE } from "./queue.constants";

@Module({
	imports: [
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const redisUrl = config.getOrThrow<string>("REDIS_URL");
				const parsed = new URL(redisUrl);

				return {
					connection: {
						host: parsed.hostname,
						port: Number(parsed.port || 6379),
						username: parsed.username || undefined,
						password: parsed.password || undefined,
						tls: parsed.protocol === "rediss:" ? {} : undefined,
					},
				};
			},
		}),
		BullModule.registerQueue({
			name: CLICK_QUEUE,
		}),
		BullBoardModule.forFeature({
			name: CLICK_QUEUE,
			adapter: BullMQAdapter,
		}),
		LinksModule,
		AnalyticsModule,
	],
	providers: [ClickProcessor],
	exports: [BullModule],
})
export class QueueModule {}
