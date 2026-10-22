import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN?.trim();
const configuredSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0);
const tracesSampleRate = Number.isFinite(configuredSampleRate)
  ? Math.min(Math.max(configuredSampleRate, 0), 1)
  : 0;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.APP_VERSION,
    tracesSampleRate,
    sendDefaultPii: false,
  });
}
