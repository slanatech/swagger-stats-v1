/*
 * Internal representation of Span
 */

const { pathOr } = require('ramda');

class Span {
  constructor() {
    this.trace_id = null;
    this.span_id = null;
    this.parent_span_id = null;
    this.isValid = false;
  }

  // Convert from Otel GRPC message
  fromOtel(msg) {
    // Can it be multiple ?
    let span = pathOr(null, ['instrumentation_library_spans', 0, 'spans', 0], msg);
    if (!span) {
      return;
    }
    this.trace_id = pathOr([], ['trace_id'], span).toString('hex') || null;
    this.span_id = pathOr([], ['span_id'], span).toString('hex') || null;
    this.parent_span_id = pathOr([], ['parent_span_id'], span).toString('hex') || null;
    this.isValid = this.trace_id !== null && this.span_id !== null;
    // TODO Attributes
    return this;
  }

  // Convert from Jaeger GRPC message
  fromJaeger() {
    // TODO Implement
  }
}

module.exports = Span;
