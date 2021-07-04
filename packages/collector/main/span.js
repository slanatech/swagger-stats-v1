/*
 * Internal representation of Span
 */

const { pathOr } = require('ramda');

class Span {
  constructor() {
    this.valid = false;
    this.traceId = null;
    this.spanId = null;
    this.parentSpanId = null;
    this.depth = null;
    this.name = null;
    this.kind = 'internal'; // default
    this.service = null;
    // status
    this.status = null;
    this.success = false; // true or false
    // attributes
    this.attributes = {};
    this.resourceAttributes = {};
  }

  // TODO Move to transforms
  // Convert attributes from array to object
  attributesToObject(attrs) {
    if (!Array.isArray(attrs) || attrs.length <= 0) {
      return {};
    }
    let attrsObj = {};
    attrs.map((x) => {
      let key = pathOr(null, ['key'], x);
      let vType = pathOr(null, ['value', 'value'], x);
      let value = null;
      switch (vType) {
        case 'string_value': {
          value = pathOr(null, ['value', 'string_value'], x);
          break;
        }
        case 'int_value': {
          value = parseInt(pathOr(null, ['value', 'int_value'], x));
          break;
        }
      }
      if (key && value) {
        attrsObj[key] = value;
      }
    });
    return attrsObj;
  }

  // TODO Move to transforms
  // Convert from Otel GRPC message
  fromOtel(msg) {
    // Can it be multiple ?
    let span = pathOr(null, ['instrumentation_library_spans', 0, 'spans', 0], msg);
    if (!span) {
      return this;
    }
    this.traceId = pathOr([], ['trace_id'], span).toString('hex') || null;
    this.spanId = pathOr([], ['span_id'], span).toString('hex') || null;
    this.parentSpanId = pathOr([], ['parent_span_id'], span).toString('hex') || null;
    this.valid = this.traceId !== null && this.spanId !== null;
    this.name = pathOr(null, ['name'], span);

    // Kind
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#spankind
    let spanKind = pathOr(null, ['kind'], span);
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
    let statusCode = pathOr(null, ['code'], this.status); // === 'STATUS_CODE_OK';
    let deprecatedStatusCode = pathOr(null, ['deprecated_code'], this.status);
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
    return this;
  }

  // Convert from Jaeger GRPC message
  fromJaeger() {
    // TODO Implement
  }
}

module.exports = Span;
