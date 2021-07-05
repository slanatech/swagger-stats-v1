/*
 * Internal representation of Trace
 */

/*
 *  Notes
 *
 *  we need to fully reconstruct entire trace with full hierarchy of spans. Why ?
 *  - we may receive spans out of order
 *  - we may receive child spans after root spans has been received
 *  - we want to take into account depth of spans in trace - i.e. at what depth error is originated
 *
 *  Important use cases to address:
 *  - Update metrics based on single span, if applicable. I.e. for kind=server update metrics for corresponding api request
 *  - Match client span with server span. if one service calls another, and both are instrumented, we should have two spans, and we'll know names of both services.
 *     can be detected - if server span has parentSpanId
 *       if not, we can assume ingress call, and that span will be the root of trace
 *     This is most likely applicable only to certain types of instrumentation: HTTP, GRPC
 *  - Detect if client span is call to 3rd-party: i.e. to Postgres, Redis ..
 *     3rd-party will not be instrumented by default - need to update metrics based on single client span in this case
 *
 * */

const { pathOr } = require('ramda');

class Trace {
  constructor(traceId) {
    this.traceId = traceId;
    this.spans = {}; // All spans in this trace by id
    this.rootSpan = null; // top span is the one without parent
    this.spanGaps = false;
  }

  // true if trace has been completed - that is, root span has been captured
  // Note we may still receive additional child spans after that
  // TODO Name TBC
  complete() {
    return this.rootSpan !== null;
  }

  // true if trace is missing chunk of spans - i.e. no path between some child span and root span
  hasSpanGaps() {
    return this.spanGaps;
  }

  addSpan(span) {
    if (span.traceId !== this.traceId) {
      return;
    }

    this.spans[span.spanId] = span;
    if (!span.parentSpanId) {
      this.rootSpan = span;
      // TODO Update timing from the root span - start, end
    }
  }

  updateSpanDepth(spanId, childSpanId) {
    let span = pathOr(null, [spanId], this.spans);
    if (!span) {
      this.spanGaps = true; // Gap detected
      return null;
    }
    if (childSpanId) {
      span.hasChild = true;
      // TODO Array and store all child Ids ?
    }
    if (span.depth !== null) {
      return span.depth; // Already known
    }
    if (!span.parentSpanId) {
      span.depth = 0; // this is root
      return span.depth;
    }
    let parentDepth = this.updateSpanDepth(span.parentSpanId, spanId);
    span.depth = parentDepth !== null ? parentDepth + 1 : null;
    return span.depth;
  }

  updateDepth() {
    this.spanGaps = false;
    for (let spanId of Object.keys(this.spans)) {
      this.updateSpanDepth(spanId, null);
    }
  }

  // Update state after adding batch of spans
  async updateState() {
    if (this.complete()) {
      // If we have root span, we can update depth
      this.updateDepth();
    }
  }
}

module.exports = Trace;
