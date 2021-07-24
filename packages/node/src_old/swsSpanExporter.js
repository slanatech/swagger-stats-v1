'use strict';
const debug = require('debug')('sws:spanexporter');
const core_1 = require('@opentelemetry/core');
/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
/* eslint-disable no-console */
class SwsSpanExporter {
  constructor(processor) {
    this.processor = processor;
  }

  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(spans, resultCallback) {
    return this._processSpans(spans, resultCallback);
  }
  /**
   * Shutdown the exporter.
   */
  shutdown() {
    this._processSpans([]);
    return Promise.resolve();
  }
  /**
   * converts span info into more readable format
   * @param span
   */
  _exportInfo(span) {
    return {
      traceId: span.spanContext.traceId,
      parentId: span.parentSpanId,
      name: span.name,
      id: span.spanContext.spanId,
      kind: span.kind,
      timestamp: core_1.hrTimeToMicroseconds(span.startTime),
      duration: core_1.hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
    };
  }
  /**
   * Showing spans in console
   * @param spans
   * @param done
   */
  _processSpans(spans, done) {
    for (const span of spans) {
      debug(this._exportInfo(span));
      this.processor.processSpan(span);
    }
    if (done) {
      return done({ code: core_1.ExportResultCode.SUCCESS });
    }
  }
}
module.exports = {
  SwsSpanExporter,
};
