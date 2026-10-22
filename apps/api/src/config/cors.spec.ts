import { describe, expect, it } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { isCorsOriginAllowed } from './cors';

function config(values: Record<string, string>): ConfigService {
  return new ConfigService(values);
}

describe('isCorsOriginAllowed', () => {
  it('allows requests without an Origin header', () => {
    expect(
      isCorsOriginAllowed(undefined, config({ NODE_ENV: 'production' })),
    ).toBe(true);
  });

  it('allows only explicitly configured production origins', () => {
    const service = config({
      NODE_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com',
    });

    expect(isCorsOriginAllowed('https://app.example.com', service)).toBe(true);
    expect(isCorsOriginAllowed('https://evil.example.com', service)).toBe(
      false,
    );
  });

  it('allows local origins outside production', () => {
    expect(
      isCorsOriginAllowed(
        'http://localhost:3000',
        config({ NODE_ENV: 'development' }),
      ),
    ).toBe(true);
  });

  it('rejects local origins in production', () => {
    expect(
      isCorsOriginAllowed(
        'http://localhost:3000',
        config({ NODE_ENV: 'production' }),
      ),
    ).toBe(false);
  });

  it('allows only HTTPS previews matching both configured boundaries', () => {
    const service = config({
      NODE_ENV: 'production',
      CORS_PREVIEW_HOST_PREFIX: 'link-engine-',
      CORS_PREVIEW_HOST_SUFFIX: '-team.vercel.app',
    });

    expect(
      isCorsOriginAllowed(
        'https://link-engine-feature-team.vercel.app',
        service,
      ),
    ).toBe(true);
    expect(
      isCorsOriginAllowed('https://other-feature-team.vercel.app', service),
    ).toBe(false);
    expect(
      isCorsOriginAllowed(
        'http://link-engine-feature-team.vercel.app',
        service,
      ),
    ).toBe(false);
  });
});
