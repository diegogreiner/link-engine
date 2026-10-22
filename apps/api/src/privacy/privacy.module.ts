import { Global, Module } from '@nestjs/common';
import { IpPrivacyService } from './ip-privacy.service';

@Global()
@Module({
  providers: [IpPrivacyService],
  exports: [IpPrivacyService],
})
export class PrivacyModule {}
