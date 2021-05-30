/*
 * Process spans and traces
 */

const { pathOr } = require('ramda');
const logger = require('./logger')('PROC');
const Trace = require('./trace');

class Processor {
  constructor() {
    this.traces = {}; // traces store
  }

  async processSpans(spansBatch) {
    for (const span of spansBatch) {
      logger.info(`Processing Span: traceId=${span.traceId}, spanId:${span.spanId}, parentSpanId:${span.parentSpanId}`);

      let trace = this.traces[span.traceId];
      if (!trace) {
        trace = new Trace(span.traceId);
        this.traces[span.traceId] = trace;
      }

      trace.addSpan(span);
    }
  }
}

const processor = new Processor();
module.exports = processor;
