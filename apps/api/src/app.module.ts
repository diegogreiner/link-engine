import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { LinksModule } from "./links/links.module";
import { PrismaModule } from "./prisma/module";
import { RedirectModule } from "./redirect/redirect.module";

import basicAuth = require("express-basic-auth");

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		AuthModule,
		LinksModule,
		PrismaModule,
		RedirectModule,
		AnalyticsModule,
		BullBoardModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const user = config.get<string>("BULL_BOARD_USER");
				const password = config.get<string>("BULL_BOARD_PASSWORD");

				if (!user || !password) {
					throw new Error(
						"BULL_BOARD_USER e BULL_BOARD_PASSWORD são obrigatórios",
					);
				}

				return {
					route: "/admin/queues",
					adapter: ExpressAdapter,
					middleware: basicAuth({
						challenge: true,
						users: {
							[user]: password,
						},
					}),
				};
			},
		}),
	],
})
export class AppModule {}
