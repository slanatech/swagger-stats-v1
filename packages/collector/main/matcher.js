/*
 * Span matcher
 */

//const { pathOr } = require('ramda');
const logger = require('./logger')('MATCHER');

// TODO Redis
class Matcher {
  constructor() {
    this.spans = {};
    this.spanCache = {}; // Very simple, do not use ttl
    this.stream = [];
  }

  async setSpan(span, ts) {
    this.spanCache[span.spanId] = span;
    this.stream.push({
      spanId: span.spanId,
      ts: ts, // timestamp when span batch was received - we delay 10 sec from that time
    });
  }

  async getSpan(spanId) {
    return this.spanCache[spanId] || null;
  }

  // return all known spans from cache - used for testing
  async getAll() {
    const res = Object.keys(this.spanCache).map((x) => this.spanCache[x]);
    return res;
  }

  // Internal / mock implementation of Redis stream analog
  async getSpansForProcessing() {
    // Returns batch of spans for processing with delay 10 sec
    if (this.stream.length <= 0) {
      return [];
    }

    // TEMP!
    //const r = this.stream.map((x) => x.spanId);
    //this.stream = [];
    //return r;

    // Find all items older than 10 sec at the beginning of the stream
    const len = this.stream.length;
    const currTs = Date.now();
    let stop = false;
    let idx = 0;
    while (idx < len && !stop) {
      if (currTs - this.stream[idx].ts <= 2000) {
        stop = true;
      } else {
        idx++;
      }
    }
    if (idx === 0) {
      return []; // none found
    }
    logger.info(`STREAM: Returning ${idx} spans ready for processing`);
    const result = this.stream.splice(0, idx).map((x) => x.spanId);
    return result;
  }
}

const matcher = new Matcher();
module.exports = matcher;
