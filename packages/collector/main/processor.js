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
    this.cssContexts = {}; // client server span contexts
    // TEMP - experimental
    this.clientSpans = {};
    this.serverSpans = {}; // ???
    this.expectedParentSpans = {};
  }

  async processSpans(spansBatch) {
    // TODO Opimize: do a first pass and store all spans from batch in hashes.
    //      then process one by one. so processing would not depend on sequence in batch.

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
    // Process depending on kind
    switch (span.kind) {
      case 'server': {
        await this.processServerSpan(span);
        break;
      }
      case 'client': {
        await this.processClientSpan(span);
        break;
      }
    }
    // TODO Post-process
  }

  // ???
  async resolveClientServerSpanContext(span) {
    let ctx = null;

    if (!(span.traceId in this.cssContexts)) {
      // we don't know anything yet
      this.cssContexts[span.traceId] = {};
      ctx = this.cssContexts[span.traceId];
    }

    switch (span.kind) {
      case 'server': {
        break;
      }
      case 'client': {
        break;
      }
    }
  }

  async processServerSpan(span) {
    logger.info(`Server Span: name: ${span.name} traceId: ${span.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);
    if (!span.parentSpanId) {
      // This is ingress span, we do not expect that there will be  corresponding client span
      monitor.inc('service_calls_total', { src: 'ingress', dst: span.service });
      return;
    }

    // We expect that there could be corresponding client span
    // Client and server spans may arrive in any order - they could be pushed via different nodes of otel collector, for instance

    // span.parentSpanId would contain client span id here, if we have matching client span

    // Find if we have a record: same traceId, and other spanId === this span.parentSpanId

    /*
    if (!(span.traceId in this.cssContexts)) {
      this.cssContexts[span.traceId] = {
        spans: {},
        parents: {},
      };
    }
    this.cssContexts[span.traceId].spans[span.spanId] = span;
    this.cssContexts[span.traceId].parents[span.parentSpanId] = span; // ???
    */

    let key = `${span.traceId}:${span.spanId}`;
    this.serverSpans[key] = span;

    // Attempt to find client span
    let clientSpanKey = `${span.traceId}:${span.parentSpanId}`;
    if (clientSpanKey in this.clientSpans) {
      let clientSpan = this.clientSpans[clientSpanKey];
      // now we can report on matched client server span pair
      monitor.inc('service_calls_total', { src: clientSpan.service, dst: span.service });
      return;
    }

    let parentKey = `${span.traceId}:${span.parentSpanId}`;
    // TODO -> Array. Is it possible to have multiple childs for one parent ? Sure !!!
    this.expectedParentSpans[parentKey] = span;

    logger.warn(`Failed to find matching client span ${clientSpanKey} - waiting`);

    // +++
  }

  async processClientSpan(span) {
    logger.info(`Client Span: name: ${span.name} traceId: ${span.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);
    // We should expect that there could be a corresponding server span - if destination service is also instrumented
    // TODO Optimize taking into account type of span - i.e. for Postgress, Redis there will be no server spans

    // span.parentSpanId here would contain higher level span in the chain of the trace processing - not related with this client server span pair

    // Find if we have a record - traceId, and other span.parentSpanId === this span.spanId

    let key = `${span.traceId}:${span.spanId}`;
    this.clientSpans[key] = span;

    // attempt to find server span which expects this client span as a parent
    if (key in this.expectedParentSpans) {
      let serverSpan = this.expectedParentSpans[key];
      // now we can report on matched client server span pair
      monitor.inc('service_calls_total', { src: span.service, dst: serverSpan.service });
      return;
    }

    logger.warn(`Failed to find matching server span: ${key}`);

    // +++
  }
}

const processor = new Processor();
module.exports = processor;
