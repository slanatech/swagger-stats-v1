/*
 * Internal representation of Trace
 */

/*
 *  Notes
 *
 *  It's questionable if we need to fully reconstruct entire trace with full hierarchy of spans. Why ?
 *  We just need to count things based on spans.
 *
 *  Important use cases to address:
 *  - Update metrics based on single span, if applicable. I.e. for kind=server update metrics for corresponding api request
 *  - Match client span with server span. if one service calls another, and both are instrumented, we should have two spans, and we'll know names of both services.
 *     can be detected - if server span has parentSpanId
 *     if not, we can assume external call
 *     This is most likely applicable only to certain types of instrumentation: HTTP, GRPC
 *  - Detect if client span is call to 3rd-party: i.e. to Postgres, Redis ..
 *     3rd-party will not be instrumented by default - need to update metrics based on single client span in this case
 *
 * */

const { pathOr } = require('ramda');

class Trace {
  constructor(traceId) {
    this.valid = false;
    this.traceId = traceId;
    this.spans = {}; // All spans in this trace by id
    this.topSpan = null; // top span is the one without parent
  }

  addSpan(span) {
    if (span.traceId !== this.traceId) {
      return;
    }

    this.spans[span.spanId] = span;
    if (!span.parentSpanId) {
      this.topSpan = span;
    }
  }
}

module.exports = Trace;
