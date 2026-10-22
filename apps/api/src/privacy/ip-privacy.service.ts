import { createHmac } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpPrivacyService {
  constructor(private readonly config: ConfigService) {}

  pseudonymize(ip: string | undefined): string | null {
    const normalizedIp = ip?.trim().toLowerCase();

    if (!normalizedIp) {
      return null;
    }

    const secret = this.config.getOrThrow<string>('IP_HASH_SECRET');

    return createHmac('sha256', secret).update(normalizedIp).digest('hex');
  }
}
