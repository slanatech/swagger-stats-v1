// Convert span from OTLP representaton to internal representation
import { pathOr } from 'ramda';
//import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
//import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { SwsSpan } from '@swaggerstats/core';
import { Buffer } from 'buffer';
//import { hrTimeToMilliseconds } from '@opentelemetry/core';
//import { resolveCategory } from '@swaggerstats/core';

function attributesToObject(attrs: any): any {
  if (!Array.isArray(attrs) || attrs.length <= 0) {
    return {};
  }
  const attrsObj: any = {};
  attrs.map((x) => {
    const key = pathOr('', ['key'], x);
    const vType: string = pathOr('', ['value', 'value'], x);
    let value = null;
    switch (vType) {
      case 'string_value': {
        value = pathOr(null, ['value', 'string_value'], x);
        break;
      }
      case 'int_value': {
        value = parseInt(pathOr('', ['value', 'int_value'], x));
        break;
      }
    }
    if (key && value) {
      attrsObj[key] = value;
    }
  });
  return attrsObj;
}

function getId(idBuffer: any) {
  if (!Buffer.isBuffer(idBuffer) || idBuffer.length <= 0) {
    return null;
  }
  return idBuffer.toString('hex'); //idObj.data.toString('hex');
}

function convertSpans(resourceAttributes: any, service: string | null, ilSpan: any): SwsSpan[] {
  if (!Array.isArray(ilSpan.spans) || ilSpan.spans.length <= 0) {
    return [];
  }

  const swsSpans: SwsSpan[] = [];

  const instrumentationLibrary = pathOr(null, ['instrumentation_library', 'name'], ilSpan);
  //const instrumentationLibraryVersion = pathOr(null, ['instrumentation_library', 'version'], ilSpan);

  // ilSpan.spans is array, cover case when it could contain multiple entries

  ilSpan.spans.map((span: any) => {
    const swsSpan = new SwsSpan();
    swsSpan.traceId = getId(pathOr(null, ['trace_id'], span));
    swsSpan.spanId = getId(pathOr(null, ['span_id'], span));
    swsSpan.parentSpanId = getId(pathOr(null, ['parent_span_id'], span));
    swsSpan.valid = swsSpan.traceId !== null && swsSpan.spanId !== null;
    swsSpan.name = pathOr(null, ['name'], span);

    swsSpan.instrumentationLibrary = instrumentationLibrary;

    // Kind
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#spankind
    const spanKind: string = pathOr('', ['kind'], span);
    switch (spanKind) {
      case 'SPAN_KIND_SERVER': {
        swsSpan.kind = 'server';
        break;
      }
      case 'SPAN_KIND_CLIENT': {
        swsSpan.kind = 'client';
        break;
      }
      case 'SPAN_KIND_PRODUCER': {
        swsSpan.kind = 'producer';
        break;
      }
      case 'SPAN_KIND_CONSUMER': {
        swsSpan.kind = 'consumer';
        break;
      }
      default: {
        swsSpan.kind = 'internal';
      }
    }

    // Status
    swsSpan.status = pathOr({}, ['status'], span);
    const statusCode = pathOr(null, ['code'], swsSpan.status); // === 'STATUS_CODE_OK';
    swsSpan.success = statusCode === 'STATUS_CODE_OK' || statusCode === 'STATUS_CODE_UNSET';
    //const deprecatedStatusCode = pathOr(null, ['deprecated_code'], swsSpan.status);
    //else if (statusCode === 'STATUS_CODE_UNSET' && deprecatedStatusCode === 'DEPRECATED_STATUS_CODE_OK') {
    //  swsSpan.success = true;
    //}

    // Timing
    swsSpan.startTime = Math.floor(Number(pathOr(0, ['start_time_unix_nano'], span)) / 1000000);
    swsSpan.endTime = Math.floor(Number(pathOr(0, ['end_time_unix_nano'], span)) / 1000000);
    swsSpan.duration = swsSpan.endTime - swsSpan.startTime;

    // Attributes
    swsSpan.attributes = attributesToObject(pathOr([], ['attributes'], span));

    // Resources
    swsSpan.resourceAttributes = resourceAttributes;
    swsSpan.service = service;

    swsSpans.push(swsSpan);
  });

  return swsSpans;
}

// Convert from Otlp GRPC message
export function fromOtlp(otlpResourceSpans: any): SwsSpan[] {
  if (!Array.isArray(otlpResourceSpans) || otlpResourceSpans.length <= 0) {
    return [];
  }

  let results: SwsSpan[] = [];

  otlpResourceSpans.map((resourceSpansEntry) => {
    const resourceAttributes = attributesToObject(pathOr([], ['resource', 'attributes'], resourceSpansEntry));
    const service = pathOr(null, ['service.name'], resourceAttributes);
    const ilSpans = pathOr([], ['instrumentation_library_spans'], resourceSpansEntry);
    ilSpans.map((ilSpan) => {
      const resultSpans = convertSpans(resourceAttributes, service, ilSpan);
      results = results.concat(resultSpans);
    });
  });

  return results;

  // It can contain multiple spans
  //const span = pathOr([], ['instrumentation_library_spans', 0, 'spans'], msg);

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
