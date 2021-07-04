/*
 * Trace store
 */

//const { pathOr } = require('ramda');
const Trace = require('./trace');

// TODO Redis
class TraceStore {
  constructor() {
    this.traces = {};
  }

  async getTrace(traceId) {
    if (!(traceId in this.traces)) {
      // TODO Load from Redis, etc
      this.traces[traceId] = new Trace(traceId);
    }
    return this.traces[traceId];
  }
}

const traceStore = new TraceStore();
module.exports = traceStore;
