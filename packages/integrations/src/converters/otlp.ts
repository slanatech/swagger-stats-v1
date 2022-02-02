// Convert span from OTLP representaton to internal representation
//import { pathOr } from 'ramda';
//import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
//import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { SwsSpan } from '@swaggerstats/core';
//import { resolveCategory } from '@swaggerstats/core';

// Convert from Otlp GRPC message
export function fromOtlp(msg: any): SwsSpan[] {
  // It can contain multiple spans
  //const span = pathOr([], ['instrumentation_library_spans', 0, 'spans'], msg);

  // TEMP !!!
  return [];
  /*
  if (!span) {
    return this;
  }
  // @ts-ignore
  this.traceId = pathOr([], ['trace_id'], span).toString('hex') || null;
  // @ts-ignore
  this.spanId = pathOr([], ['span_id'], span).toString('hex') || null;
  // @ts-ignore
  this.parentSpanId = pathOr([], ['parent_span_id'], span).toString('hex') || null;
  this.valid = this.traceId !== null && this.spanId !== null;
  this.name = pathOr(null, ['name'], span);

  // Kind
  // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#spankind
  const spanKind = pathOr(null, ['kind'], span);
  if (spanKind === 'SPAN_KIND_SERVER') {
    this.kind = 'server';
  } else if (spanKind === 'SPAN_KIND_CLIENT') {
    this.kind = 'client';
  } else if (spanKind === 'SPAN_KIND_PRODUCER') {
    this.kind = 'producer';
  } else if (spanKind === 'SPAN_KIND_CONSUMER') {
    this.kind = 'consumer';
  } else {
    this.kind = 'internal';
  }

  // Status
  this.status = pathOr({}, ['status'], span);
  const statusCode = pathOr(null, ['code'], this.status); // === 'STATUS_CODE_OK';
  const deprecatedStatusCode = pathOr(null, ['deprecated_code'], this.status);
  this.success = false;
  if (statusCode === 'STATUS_CODE_OK') {
    this.success = true;
  } else if (statusCode === 'STATUS_CODE_UNSET' && deprecatedStatusCode === 'DEPRECATED_STATUS_CODE_OK') {
    this.success = true;
  }

  // TODO Timing
  // Attributes
  this.attributes = this.attributesToObject(pathOr([], ['attributes'], span));

  // Resources
  this.resourceAttributes = this.attributesToObject(pathOr([], ['resource', 'attributes'], msg));
  this.service = pathOr(null, ['service.name'], this.resourceAttributes);

  // Instrumentation TODO Check
  this.instrumentationLibrary = pathOr(null, ['instrumentationLibrary', 'name'], span);

  return this;
  */
}

/*
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
*/
