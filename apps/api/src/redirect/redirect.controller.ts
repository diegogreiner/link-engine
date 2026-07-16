import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { LinksService } from "src/links/links.service";

@Controller()
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

		if (link.ga4MeasurementId) {
			res.setHeader("Content-Type", "text/html; charset=utf-8");
			res.send(this.buildGa4RedirectPage(link.ga4MeasurementId, link.originalUrl));
			return;
		}

		return res.redirect(302, link.originalUrl);
	}

	private buildGa4RedirectPage(measurementId: string, destinationUrl: string): string {
		const escapedUrl = destinationUrl
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		const escapedMeasurementId = measurementId
			.replace(/&/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0;url=${escapedUrl}">
<title>Redirecionando...</title>
<script async src="https://www.googletagmanager.com/gtag/js?id=${escapedMeasurementId}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${escapedMeasurementId}');
gtag('event', 'page_view', { 'link_redirect': true });
</script>
</head>
<body>
<p>Redirecionando para <a href="${escapedUrl}">${escapedUrl}</a>...</p>
<script>window.location.replace("${escapedUrl}");</script>
</body>
</html>`;
	}
}
