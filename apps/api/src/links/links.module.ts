import { Module } from "@nestjs/common";
import { AnalyticsModule } from "src/analytics/analytics.module";
import { PrismaModule } from "src/prisma/module";
import { LinksController } from "./links.controller";
import { LinksService } from "./links.service";

@Module({
	imports: [PrismaModule, AnalyticsModule],
	controllers: [LinksController],
	providers: [LinksService],
	exports: [LinksService],
})
export class LinksModule {}
