import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { LinksService } from "src/links/links.service";

@Controller("links/redirect")
export class RedirectController {
	constructor(private readonly linksService: LinksService) {}

	@Get(":shortCode")
	async redirect(@Param("shortCode") shortCode: string, @Res() res: Response) {
		const link = await this.linksService.findByShortCode(shortCode);
		return res.redirect(302, link.originalUrl);
	}
}
