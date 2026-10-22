import type { ConfigService } from '@nestjs/config';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

function configuredOrigins(config: ConfigService): Set<string> {
  const value = config.get<string>('CORS_ALLOWED_ORIGINS') ?? '';

  return new Set(
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => new URL(origin).origin),
  );
}

function isAuthorizedPreview(origin: URL, config: ConfigService): boolean {
  const prefix = config.get<string>('CORS_PREVIEW_HOST_PREFIX')?.trim();
  const suffix = config.get<string>('CORS_PREVIEW_HOST_SUFFIX')?.trim();

  if (!prefix || !suffix || origin.protocol !== 'https:' || origin.port) {
    return false;
  }

  return origin.hostname.startsWith(prefix) && origin.hostname.endsWith(suffix);
}

export function isCorsOriginAllowed(
  originValue: string | undefined,
  config: ConfigService,
): boolean {
  if (!originValue) {
    return true;
  }

  let origin: URL;

  try {
    origin = new URL(originValue);
  } catch {
    return false;
  }

  if (configuredOrigins(config).has(origin.origin)) {
    return true;
  }

  const environment = config.get<string>('NODE_ENV') ?? 'development';

  if (environment !== 'production' && LOCAL_ORIGINS.has(origin.origin)) {
    return true;
  }

  return isAuthorizedPreview(origin, config);
}

export function createCorsOptions(config: ConfigService): CorsOptions {
  return {
    credentials: true,
    origin(origin, callback) {
      callback(null, isCorsOriginAllowed(origin, config));
    },
  };
}
