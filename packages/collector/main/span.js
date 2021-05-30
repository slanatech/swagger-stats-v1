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
    this.name = null;
    this.kind = null;
    this.service = null;
    // status
    this.status = null;
    this.success = false;
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
      return;
    }
    this.traceId = pathOr([], ['trace_id'], span).toString('hex') || null;
    this.spanId = pathOr([], ['span_id'], span).toString('hex') || null;
    this.parentSpanId = pathOr([], ['parent_span_id'], span).toString('hex') || null;
    this.valid = this.traceId !== null && this.spanId !== null;
    this.name = pathOr(null, ['name'], span);
    this.kind = pathOr(null, ['kind'], span);
    // Status
    this.status = pathOr({}, ['status'], span);
    this.success = pathOr(null, ['code'], this.status) === 'STATUS_CODE_OK';
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
