import { createKeyv } from "@keyv/redis";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
	imports: [
		NestCacheModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const redisUrl = config.getOrThrow<string>("REDIS_URL");

				return {
					stores: [createKeyv(redisUrl)],
				};
			},
		}),
	],
	exports: [NestCacheModule],
})
export class CacheModule {}