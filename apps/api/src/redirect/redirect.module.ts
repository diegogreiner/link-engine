import { Module } from "@nestjs/common";
import { LinksModule } from "src/links/links.module";
import { QueueModule } from "src/queue/queue.module";
import { RedirectController } from "./redirect.controller";

@Module({
	imports: [LinksModule, QueueModule],
	controllers: [RedirectController],
})
export class RedirectModule {}
