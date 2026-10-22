import { randomUUID } from 'node:crypto';
import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';

export function createLoggerConfig(config: ConfigService): Params {
  const environment = config.get<string>('NODE_ENV') ?? 'development';

  return {
    pinoHttp: {
      level: config.get<string>('LOG_LEVEL') ?? 'info',
      genReqId(request, response) {
        const header = request.headers['x-request-id'];
        const candidate = Array.isArray(header) ? header[0] : header;
        const requestId =
          typeof candidate === 'string' && candidate.length <= 128
            ? candidate
            : randomUUID();

        response.setHeader('x-request-id', requestId);
        return requestId;
      },
      customProps: () => ({
        service: 'link-engine-api',
        environment,
        version: config.get<string>('APP_VERSION') ?? 'development',
      }),
      serializers: {
        req(request) {
          return {
            id: request.id,
            method: request.method,
            url: request.url,
          };
        },
        res(response) {
          return { statusCode: response.statusCode };
        },
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers.set-cookie',
          'password',
          'token',
          'refreshToken',
          'ip',
        ],
        censor: '[REDACTED]',
      },
      autoLogging: {
        ignore: (request) => request.url?.startsWith('/health/') ?? false,
      },
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) return 'error';
        if (response.statusCode >= 400) return 'warn';
        return 'info';
      },
    },
  };
}
