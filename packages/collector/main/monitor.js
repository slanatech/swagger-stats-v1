/**
 * Swagger Stats Prometheus Monitor
 */
const { pathOr } = require('ramda');
const utils = require('./utils');
const logger = require('./logger')('MONITOR');

const { METRICS } = require('./metrics');

class Monitor {
  constructor() {
    this.initialized = false;
    this.promClientMetrics = {};
  }

  // Initialize
  init() {
    this.promClientMetrics = utils.getMetrics('sws', METRICS);
    this.initialized = true;
    logger.info('Metrics Initialized');
    logger.debug('Metrics Initialized - DEBUG');
    return true;
  }

  getMetric(metricName) {
    return pathOr(null, [metricName], this.promClientMetrics);
  }

  inc(metricName, labels) {
    let metric = this.getMetric(metricName);
    if (metric) {
      try {
        metric.inc(labels);
      } catch (e) {
        // noop
      }
    }
  }

  dec(metricName, labels) {
    let metric = this.getMetric(metricName);
    if (metric) {
      try {
        metric.dec(labels);
      } catch (e) {
        // noop
      }
    }
  }

  set(metricName, labels, value) {
    let metric = this.getMetric(metricName);
    if (metric) {
      try {
        metric.set(labels, value);
      } catch (e) {
        // noop
      }
    }
  }

  reset(metricName) {
    let metric = this.getMetric(metricName);
    if (metric) {
      metric.reset();
    }
  }

  // ???
  removeMetric(metricName, labels) {
    let metric = this.promClientMetrics[metricName];
    utils.metricRemoveByLabels(metric, labels);
  }
}

let monitor = new Monitor();
monitor.init();
module.exports = monitor;
