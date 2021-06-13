/*
 * Process spans and traces
 */

const { pathOr } = require('ramda');
const logger = require('./logger')('PROC');
const Trace = require('./trace');
const monitor = require('./monitor');

class Processor {
  constructor() {
    this.traces = {}; // traces store
  }

  async processSpans(spansBatch) {
    for (const span of spansBatch) {
      logger.info(`Processing Span: name: ${span.name} traceId: ${span.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);

      let trace = this.traces[span.traceId];
      if (!trace) {
        trace = new Trace(span.traceId);
        this.traces[span.traceId] = trace;
      }

      trace.addSpan(span);

      await this.processSingleSpan(span);
    }
  }

  async processSingleSpan(span) {
    // update generic metrics
    monitor.inc('spans_processed_total');
    if (span.service) {
      monitor.inc('service_spans_processed_total', { service: span.service });
      monitor.inc('service_spans_total', {
        service: span.service,
        kind: span.kind,
        success: span.success,
      });
    }
  }
}

const processor = new Processor();
module.exports = processor;
