import { describe, expect, it } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { IpPrivacyService } from './ip-privacy.service';

describe('IpPrivacyService', () => {
  const service = new IpPrivacyService(
    new ConfigService({ IP_HASH_SECRET: 'test-secret' }),
  );

  it('returns a stable HMAC without exposing the source IP', () => {
    const result = service.pseudonymize('203.0.113.10');

    expect(result).toHaveLength(64);
    expect(result).toBe(service.pseudonymize('203.0.113.10'));
    expect(result).not.toContain('203.0.113.10');
  });

  it('normalizes whitespace and casing', () => {
    expect(service.pseudonymize(' 2001:DB8::1 ')).toBe(
      service.pseudonymize('2001:db8::1'),
    );
  });

  it('returns null when no IP is available', () => {
    expect(service.pseudonymize(undefined)).toBeNull();
    expect(service.pseudonymize(' ')).toBeNull();
  });
});
