import { Module } from "@nestjs/common";
import { LinksModule } from "src/links/links.module";
import { RedirectController } from "./redirect.controller";

@Module({
	imports: [LinksModule],
	controllers: [RedirectController],
})
export class RedirectModule {}
