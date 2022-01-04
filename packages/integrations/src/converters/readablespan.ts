import { pathOr } from 'ramda';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { SwsSpan } from '@swaggerstats/core';
import { resolveCategory } from '@swaggerstats/core';

export function fromReadableSpan(span: ReadableSpan): SwsSpan {
  const swsSpan = new SwsSpan();
  swsSpan.traceId = pathOr(null, ['_spanContext', 'traceId'], span);
  swsSpan.spanId = pathOr(null, ['_spanContext', 'spanId'], span);
  swsSpan.parentSpanId = pathOr(null, ['parentSpanId'], span);
  swsSpan.valid = swsSpan.traceId !== null && swsSpan.spanId !== null;
  swsSpan.name = pathOr(null, ['name'], span);

  // https://github.com/open-telemetry/opentelemetry-js-api/blob/main/src/trace/span_kind.ts
  const spanKind: number = pathOr(0, ['kind'], span);
  if (spanKind === 1) {
    swsSpan.kind = 'server';
  } else if (spanKind === 2) {
    swsSpan.kind = 'client';
  } else if (spanKind === 3) {
    swsSpan.kind = 'producer';
  } else if (spanKind === 4) {
    swsSpan.kind = 'consumer';
  } else {
    swsSpan.kind = 'internal';
  }

  // Status
  // https://github.com/open-telemetry/opentelemetry-js-api/blob/main/src/trace/status.ts
  swsSpan.status = pathOr({}, ['status'], span);
  const statusCode: number = pathOr(0, ['code'], swsSpan.status); // === 'STATUS_CODE_OK';
  swsSpan.success = false;
  if (statusCode === 1 || statusCode === 0) {
    swsSpan.success = true;
  }

  // Timing
  swsSpan.startTime = hrTimeToMilliseconds(span.startTime);
  swsSpan.endTime = hrTimeToMilliseconds(span.endTime);
  swsSpan.duration = hrTimeToMilliseconds(span.duration);

  // Attributes
  swsSpan.attributes = pathOr({}, ['attributes'], span);

  // Resources
  swsSpan.resourceAttributes = pathOr({}, ['resource', 'attributes'], span);
  swsSpan.service = pathOr(null, ['service.name'], swsSpan.resourceAttributes);

  // Instrumentation
  swsSpan.instrumentationLibrary = pathOr(null, ['instrumentationLibrary', 'name'], span);

  // Category
  resolveCategory(swsSpan);

  return swsSpan;
}
