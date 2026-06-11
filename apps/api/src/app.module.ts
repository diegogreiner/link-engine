import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { LinksModule } from "./links/links.module";
import { PrismaModule } from "./prisma/module";
import { RedirectModule } from "./redirect/redirect.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		AuthModule,
		LinksModule,
		PrismaModule,
		RedirectModule,
	],
})
export class AppModule {}
