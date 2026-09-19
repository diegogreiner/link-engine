import { Module } from "@nestjs/common";
import { CacheModule } from "src/cache/cache.module";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsCacheService } from "./analytics-cache.service";

@Module({
	imports: [CacheModule],
	controllers: [AnalyticsController],
	providers: [AnalyticsService, AnalyticsCacheService],
	exports: [AnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}
