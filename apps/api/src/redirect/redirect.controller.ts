import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { LinksService } from "src/links/links.service";

@Controller("links/redirect")
export class RedirectController {
	constructor(private readonly linksService: LinksService) {}

	@Get(":shortCode")
	async redirect(
		@Param("shortCode") shortCode: string,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const link = await this.linksService.findByShortCode(shortCode);

		const ip =
			req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.ip;
		const userAgent = req.headers["user-agent"] || "";
		const referer = req.headers["referer"] || "";

		void this.linksService.registerAccess(link.id, {
			ip,
			userAgent,
			referer,
		});
		
		return res.redirect(302, link.originalUrl);
	}
}
