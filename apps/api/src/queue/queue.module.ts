import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { LinksModule } from "src/links/links.module";
import { ClickProcessor } from "./click.processor";
import { CLICK_QUEUE } from "./queue.constants";

@Module({
	imports: [
		BullModule.forRoot({
			connection: {
				host: "localhost",
				port: 6379,
			},
		}),
		BullModule.registerQueue({
			name: CLICK_QUEUE,
		}),
		LinksModule,
	],
	providers: [ClickProcessor],
	exports: [BullModule],
})
export class QueueModule {}
