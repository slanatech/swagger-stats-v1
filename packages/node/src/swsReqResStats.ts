/**
 * Request / Response statistics
 */

import * as swsUtil from './swsUtil';
import { SwsSpan } from '@swaggerstats/core';

export class SwsReqResStats {
  public requests = 0; // Total number of requests received
  public responses = 0; // Total number of responses sent
  public errors = 0; // Total number of error responses
  public info = 0; // Total number of informational responses
  public success = 0; // Total number of success responses
  public redirect = 0; // Total number of redirection responses
  public client_error = 0; // Total number of client error responses
  public server_error = 0; // Total number of server error responses
  public total_time = 0; // Sum of total processing time (from request received to response finished)
  public max_time = 0; // Maximum observed processed time
  public avg_time = 0; // Average processing time
  public total_req_clength = 0; // Total (Sum) of Content Lengths of received requests
  public max_req_clength = 0; // Maximum observed Content length in received requests
  public avg_req_clength = 0; // Average Content Length in received requests
  public total_res_clength = 0; // Total (Sum) of Content Lengths of sent responses
  public max_res_clength = 0; // Maximum observed Content Length in sent responses
  public avg_res_clength = 0; // Average Content Length in sent responses
  public req_rate = 0; // Request Rate
  public err_rate = 0; // Error Rate
  public apdex_threshold = 50; // Apdex threshold
  public apdex_satisfied = 0; // Total number of "satisfied" responses for Apdex: time <= apdex_threshold
  public apdex_tolerated = 0; // Total number of "tolerated" responses for Apdex: time <= (apdex_threshold*4)
  public apdex_score = 0; // Apdex score: (apdex_satisfied + (apdex_tolerated/2))/responses

  constructor(apdex_threshold = 50) {
    this.apdex_threshold = apdex_threshold;
  }

  countSpan(span: SwsSpan): void {
    // Req
    this.requests++;
    // TODO Req / Res Content Length
    //this.total_req_clength += clength;
    //if (this.max_req_clength < clength) this.max_req_clength = clength;
    //this.avg_req_clength = Math.floor(this.total_req_clength / this.requests);

    // TEMP TODO Get from span
    const code = 200;
    const codeclass = 'success';
    const duration = 0;

    // Res
    this.responses++;
    this[codeclass]++;
    if (swsUtil.isError(code)) this.errors++;
    this.total_time += duration;
    this.avg_time = this.total_time / this.requests;
    if (this.max_time < duration) this.max_time = duration;

    // TODO Req / Res Content Length
    //this.total_res_clength += clength;
    //if (this.max_res_clength < clength) this.max_res_clength = clength;
    //this.avg_res_clength = Math.floor(this.total_res_clength / this.responses);

    // Apdex: https://en.wikipedia.org/wiki/Apdex
    if (codeclass === 'success' || codeclass === 'redirect') {
      if (duration <= this.apdex_threshold) {
        this.apdex_satisfied++;
      } else if (duration <= this.apdex_threshold * 4) {
        this.apdex_tolerated++;
      }
    }
    this.apdex_score = (this.apdex_satisfied + this.apdex_tolerated / 2) / this.responses;
  }

  updateRates(elapsed: number): void {
    //this.req_rate = Math.round( (this.requests / elapsed) * 1e2 ) / 1e2; //;
    this.req_rate = this.requests / elapsed;
    this.err_rate = this.errors / elapsed;
  }
}

/*
// Request / Response statistics
// apdex_threshold: Thresold for apdex calculation, in milliseconds 50 (ms) by default
function SwsReqResStats(apdex_threshold) {
  this.requests = 0; // Total number of requests received
  this.responses = 0; // Total number of responses sent
  this.errors = 0; // Total number of error responses
  this.info = 0; // Total number of informational responses
  this.success = 0; // Total number of success responses
  this.redirect = 0; // Total number of redirection responses
  this.client_error = 0; // Total number of client error responses
  this.server_error = 0; // Total number of server error responses
  this.total_time = 0; // Sum of total processing time (from request received to response finished)
  this.max_time = 0; // Maximum observed processed time
  this.avg_time = 0; // Average processing time
  this.total_req_clength = 0; // Total (Sum) of Content Lengths of received requests
  this.max_req_clength = 0; // Maximum observed Content length in received requests
  this.avg_req_clength = 0; // Average Content Length in received requests
  this.total_res_clength = 0; // Total (Sum) of Content Lengths of sent responses
  this.max_res_clength = 0; // Maximum observed Content Length in sent responses
  this.avg_res_clength = 0; // Average Content Length in sent responses
  this.req_rate = 0; // Request Rate
  this.err_rate = 0; // Error Rate
  this.apdex_threshold = typeof apdex_threshold !== 'undefined' ? apdex_threshold : 50; // Apdex threshold
  this.apdex_satisfied = 0; // Total number of "satisfied" responses for Apdex: time <= apdex_threshold
  this.apdex_tolerated = 0; // Total number of "tolerated" responses for Apdex: time <= (apdex_threshold*4)
  this.apdex_score = 0; // Apdex score: (apdex_satisfied + (apdex_tolerated/2))/responses
  // TODO Consider: counts by exact response code
}

SwsReqResStats.prototype.countRequest = function (clength) {
  this.requests++;
  this.total_req_clength += clength;
  if (this.max_req_clength < clength) this.max_req_clength = clength;
  this.avg_req_clength = Math.floor(this.total_req_clength / this.requests);
};

SwsReqResStats.prototype.countResponse = function (code, codeclass, duration, clength) {
  this.responses++;
  this[codeclass]++;
  if (swsUtil.isError(code)) this.errors++;
  this.total_time += duration;
  this.avg_time = this.total_time / this.requests;
  if (this.max_time < duration) this.max_time = duration;
  this.total_res_clength += clength;
  if (this.max_res_clength < clength) this.max_res_clength = clength;
  this.avg_res_clength = Math.floor(this.total_res_clength / this.responses);

  // Apdex: https://en.wikipedia.org/wiki/Apdex
  if (codeclass === 'success' || codeclass === 'redirect') {
    if (duration <= this.apdex_threshold) {
      this.apdex_satisfied++;
    } else if (duration <= this.apdex_threshold * 4) {
      this.apdex_tolerated++;
    }
  }
  this.apdex_score = (this.apdex_satisfied + this.apdex_tolerated / 2) / this.responses;
};

SwsReqResStats.prototype.updateRates = function (elapsed) {
  //this.req_rate = Math.round( (this.requests / elapsed) * 1e2 ) / 1e2; //;
  this.req_rate = this.requests / elapsed;
  this.err_rate = this.errors / elapsed;
};

module.exports = SwsReqResStats;
*/
