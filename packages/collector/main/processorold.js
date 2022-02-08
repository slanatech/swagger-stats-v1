/*
 * Process spans and traces
 */

/*  Notes
 *  Need to cover cases when some spans from the same trace may arrive out of order or with delay
 *       i.e. different otel collector used by different services, and spans from one of the services processed / delivered with delay
 *
 *  Will need a timeout that:
 *  1) Starts after we got top-level span for the trace - the one without parent
 *  2) Expires after configurable time - 1 min ? - and at that point we consider trace complete and calculate metrics on the entire trace
 *
 *  Need to have special metric which should increase if we received spans for the trace we consider complete.
 *  Indicator of spans delivery delays and possibly the need to increase timeout
 *
 * */

/*
 * TODO REVISIT - Make client/server matching more robust, support same trace spans split across multiple batches
 * */

const { pathOr } = require('ramda');
const logger = require('./logger')('PROC');
const Trace = require('./trace');
const traceStore = require('./tracestore');
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
    // do a first pass and pre-process all spans from the batch, storing them in traces
    await this.preProcessBatch(spansBatch);

    // then process one by one. so processing would not depend on sequence in batch.
    for (const span of spansBatch) {
      logger.info(`Processing Span: name: ${span.name} traceId: ${span.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);
      await this.processSingleSpan(span);
    }

    // Then process traces which were completed in this batch
    let finishedTraces = this.getFinishedTraceIds(spansBatch);
    finishedTraces.map(async (traceId) => {
      const trace = await traceStore.getTrace(traceId);
      await this.processFinishedTrace(trace);
    });
  }

  // Return array of traceIds finished in this spans batch, i.e. ones that received root span
  // TODO REVISIT - We can receive root span in previous batch, especially if it's trace across multiple services
  getFinishedTraceIds(spansBatch) {
    let finishedTraces = [];
    for (const span of spansBatch) {
      if (!span.parentSpanId) {
        finishedTraces.push(span.traceId);
      }
    }
    return finishedTraces;
  }

  async preProcessBatch(spansBatch) {
    let affectedTraces = {};

    // Add all the spans from this batch to their traces
    for (const span of spansBatch) {
      const trace = await traceStore.getTrace(span.traceId);
      trace.addSpan(span);
      affectedTraces[span.traceId] = trace;
    }

    // Post-process all affected traces
    for (let traceId of Object.keys(affectedTraces)) {
      let trace = affectedTraces[traceId];
      await trace.updateState();
    }
  }

  async processFinishedTrace(trace) {
    // loop through all the spans and calculate all the metrics that require trace context
    for (let spanId of Object.keys(trace.spans)) {
      let span = trace.spans[spanId];
      switch (span.kind) {
        case 'server': {
          await this.processTraceServerSpan(trace, span);
          break;
        }
        case 'client': {
          await this.processTraceClientSpan(trace, span);
          break;
        }
      }
    }
  }

  async processTraceServerSpan(trace, span) {
    logger.info(`Server Span: name: ${span.name} traceId: ${trace.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);
    if (!span.parentSpanId) {
      // This is ingress span, we do not expect that there will be  corresponding client span
      monitor.inc('service_calls_total', { src: 'external', dst: span.service });
      return;
    }
    let parentSpan = pathOr(null, [span.parentSpanId], trace.spans);
    if (!parentSpan) {
      logger.error({ trace: trace.traceId }, `span: ${span.spanId} - parent ${span.parentSpanId} not found`);
      // TODO metric
      return;
    }
    monitor.inc('service_calls_total', { src: parentSpan.service, dst: span.service });
  }

  async processTraceClientSpan(trace, span) {
    logger.info(`Client Span: name: ${span.name} traceId: ${trace.traceId}, spanId: ${span.spanId}, parentSpanId: ${span.parentSpanId}, status: ${JSON.stringify(span.status)}`);
    if (span.hasChild) {
      return; // done, counted from server span which is child of this one
    }
    // check well-known attributes of client span
    if ('db.system' in span.attributes && span.attributes['db.system'] === 'postgresql') {
      monitor.inc('service_calls_total', { src: span.service, dst: span.attributes['db.connection_string'] || 'postgresql' });
    }
  }

  // This is to process individual span without trace context. Trace may or may not be finished at this time.
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
    // Process depending on kind - TODO Reconsider
    /*
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
     */
    // TODO Post-process
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

    let key = `${span.traceId}:${span.spanId}`;
    this.serverSpans[key] = span;

    // Attempt to find parent client span
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
