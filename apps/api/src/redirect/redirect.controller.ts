import { InjectQueue } from '@nestjs/bullmq';
import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { minutes, Throttle } from '@nestjs/throttler';
import { Queue } from 'bullmq';
import { Request, Response } from 'express';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { LinksService } from 'src/links/links.service';
import { IpPrivacyService } from 'src/privacy/ip-privacy.service';
import { CLICK_QUEUE, PROCESS_CLICK_JOB } from 'src/queue/queue.constants';

@ApiTags('Redirect')
@ApiSecurity({})
@Controller()
export class RedirectController {
  constructor(
    private readonly linksService: LinksService,
    @InjectQueue(CLICK_QUEUE) private queue: Queue,
    private readonly ipPrivacy: IpPrivacyService,
  ) {}

  @Throttle({
    default: {
      limit: 20,
      ttl: minutes(1),
    },
  })
  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirecionar um código curto para a URL original' })
  @ApiParam({ name: 'shortCode', example: 'aB3xYz' })
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Página HTML intermediária usada quando o link possui GA4',
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para a URL original',
    headers: {
      Location: {
        description: 'URL original do link',
        schema: { type: 'string', format: 'uri' },
      },
    },
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiGoneResponse({
    description: 'O link expirou',
    type: ErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const link = await this.linksService.findByShortCode(shortCode);

    const ipHash = this.ipPrivacy.pseudonymize(req.ip);
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const country = this.readLocationHeader(
      req.headers['x-vercel-ip-country'] ?? req.headers['cf-ipcountry'],
    );
    const city = this.readLocationHeader(req.headers['x-vercel-ip-city']);

    const eventId = crypto.randomUUID();

    await this.queue.add(
      PROCESS_CLICK_JOB,
      {
        eventId,
        linkId: link.id,
        userId: link.userId,
        ipHash,
        country,
        city,
        userAgent,
        referer,
      },
      {
        attempts: 4,
        removeOnComplete: true,
        removeOnFail: true,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    if (link.ga4MeasurementId) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(
        this.buildGa4RedirectPage(link.ga4MeasurementId, link.originalUrl),
      );
      return;
    }

    return res.redirect(302, link.originalUrl);
  }

  private readLocationHeader(
    value: string | string[] | undefined,
  ): string | null {
    const raw = Array.isArray(value) ? value[0] : value;

    if (!raw) {
      return null;
    }

    try {
      return decodeURIComponent(raw).slice(0, 120);
    } catch {
      return raw.slice(0, 120);
    }
  }

  private buildGa4RedirectPage(
    measurementId: string,
    destinationUrl: string,
  ): string {
    const escapedUrl = destinationUrl
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const escapedMeasurementId = measurementId
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

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
