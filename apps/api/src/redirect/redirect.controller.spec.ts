import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: () => () => undefined,
}));
jest.mock('nanoid', () => ({ nanoid: jest.fn() }));

import type { Queue } from 'bullmq';
import type { Request, Response } from 'express';
import type { LinksService } from 'src/links/links.service';
import type { IpPrivacyService } from 'src/privacy/ip-privacy.service';
import { PROCESS_CLICK_JOB } from 'src/queue/queue.constants';
import { RedirectController } from './redirect.controller';

describe('RedirectController', () => {
  let linksService: {
    findByShortCode: jest.Mock<LinksService['findByShortCode']>;
  };
  let queue: {
    add: jest.Mock<
      (name: string, data: unknown, options: unknown) => Promise<any>
    >;
  };
  let ipPrivacy: {
    pseudonymize: jest.Mock<(ip: string | undefined) => string | null>;
  };
  let response: {
    setHeader: jest.Mock<(name: string, value: string) => void>;
    send: jest.Mock<(body: string) => Response>;
    redirect: jest.Mock<(status: number, url: string) => Response>;
  };
  let controller: RedirectController;

  const link = {
    id: 'link-1',
    userId: 'user-1',
    shortCode: 'abc123',
    originalUrl: 'https://example.com/path',
    expiresAt: null,
    ga4MeasurementId: null,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    updatedAt: new Date('2026-09-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    linksService = {
      findByShortCode: jest.fn<LinksService['findByShortCode']>(),
    };
    queue = {
      add: jest.fn<
        (name: string, data: unknown, options: unknown) => Promise<any>
      >(),
    };
    ipPrivacy = {
      pseudonymize: jest.fn<(ip: string | undefined) => string | null>(),
    };
    ipPrivacy.pseudonymize.mockReturnValue('hashed-ip');
    response = {
      setHeader: jest.fn<(name: string, value: string) => void>(),
      send: jest.fn<(body: string) => Response>(),
      redirect: jest.fn<(status: number, url: string) => Response>(),
    };
    controller = new RedirectController(
      linksService as unknown as LinksService,
      queue as unknown as Queue,
      ipPrivacy as unknown as IpPrivacyService,
    );
    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-4000-8000-000000000001');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function request(headers: Request['headers'], ip = '198.51.100.20') {
    return { headers, ip } as Request;
  }

  // Tradução: deve buscar o link e enfileirar todos os dados do clique.
  it('should look up the link and enqueue all click data', async () => {
    // Mocks
    linksService.findByShortCode.mockResolvedValue(link);
    const req = request(
      {
        'x-forwarded-for': '203.0.113.10, 10.0.0.2',
        'user-agent': 'Mozilla/5.0',
        referer: 'https://google.com',
      },
      '203.0.113.10',
    );

    // Chamada
    await controller.redirect('abc123', req, response as unknown as Response);

    // Resultados
    expect(linksService.findByShortCode).toHaveBeenCalledWith('abc123');
    expect(queue.add).toHaveBeenCalledWith(
      PROCESS_CLICK_JOB,
      {
        eventId: '00000000-0000-4000-8000-000000000001',
        linkId: link.id,
        userId: link.userId,
        ipHash: 'hashed-ip',
        country: null,
        city: null,
        userAgent: 'Mozilla/5.0',
        referer: 'https://google.com',
      },
      {
        attempts: 4,
        removeOnComplete: true,
        removeOnFail: true,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  });

  // Tradução: deve usar o IP direto da requisição quando x-forwarded-for não existir.
  it('should pseudonymize the request IP before enqueueing', async () => {
    // Mocks
    linksService.findByShortCode.mockResolvedValue(link);
    const req = request({}, '198.51.100.20');

    // Chamada
    await controller.redirect('abc123', req, response as unknown as Response);

    // Resultados
    expect(ipPrivacy.pseudonymize).toHaveBeenCalledWith('198.51.100.20');
    expect(queue.add).toHaveBeenCalledWith(
      PROCESS_CLICK_JOB,
      expect.objectContaining({ ipHash: 'hashed-ip' }),
      expect.any(Object),
    );
  });

  it('reads country and city from trusted provider headers', async () => {
    linksService.findByShortCode.mockResolvedValue(link);

    await controller.redirect(
      'abc123',
      request({
        'x-vercel-ip-country': 'BR',
        'x-vercel-ip-city': 'S%C3%A3o%20Paulo',
      }),
      response as unknown as Response,
    );

    expect(queue.add).toHaveBeenCalledWith(
      PROCESS_CLICK_JOB,
      expect.objectContaining({ country: 'BR', city: 'São Paulo' }),
      expect.any(Object),
    );
  });

  // Tradução: deve responder com redirecionamento HTTP 302 quando não houver GA4.
  it('should respond with HTTP 302 when the link has no GA4 measurement ID', async () => {
    // Mocks
    linksService.findByShortCode.mockResolvedValue(link);

    // Chamada
    await controller.redirect(
      'abc123',
      request({}),
      response as unknown as Response,
    );

    // Resultados
    expect(response.redirect).toHaveBeenCalledWith(302, link.originalUrl);
    expect(response.send).not.toHaveBeenCalled();
  });

  // Tradução: deve enviar uma página HTML quando o link tiver um measurement ID do GA4.
  it('should send an HTML page when the link has a GA4 measurement ID', async () => {
    // Mocks
    linksService.findByShortCode.mockResolvedValue({
      ...link,
      ga4MeasurementId: 'G-ABC123',
    });

    // Chamada
    await controller.redirect(
      'abc123',
      request({}),
      response as unknown as Response,
    );

    // Resultados
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/html; charset=utf-8',
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.stringContaining("gtag('config', 'G-ABC123')"),
    );
    expect(response.redirect).not.toHaveBeenCalled();
  });

  // Tradução: deve escapar a URL de destino e o measurement ID inseridos no HTML.
  it('should escape the destination URL and measurement ID embedded in HTML', async () => {
    // Mocks
    linksService.findByShortCode.mockResolvedValue({
      ...link,
      originalUrl: 'https://example.com/?a=1&next="<script>"',
      ga4MeasurementId: 'G-ABC&"><script>',
    });

    // Chamada
    await controller.redirect(
      'abc123',
      request({}),
      response as unknown as Response,
    );

    // Resultados
    const html = response.send.mock.calls[0][0];
    expect(html).toContain(
      'https://example.com/?a=1&amp;next=&quot;&lt;script&gt;&quot;',
    );
    expect(html).toContain('G-ABC&amp;&quot;&gt;&lt;script&gt;');
    expect(html).not.toContain('G-ABC&"><script>');
  });
});
