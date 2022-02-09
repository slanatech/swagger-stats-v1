/*
 * Validate that all received spans were correctly processed
 * // TODO move to tests
 */

//const { pathOr } = require('ramda');
const logger = require('./logger')('VALIDATOR');
const matcher = require('./matcher');
const promClient = require('prom-client');
const monitor = require('./monitor');

// TODO Move to test
class Validator {
  constructor() {
    //this.spans = {};
  }

  async validate() {
    const allSpans = await matcher.getAll();
    logger.info(`Validating ${allSpans.length} received spans`);
    monitor.inc('spans_processed_total');
    const allMetrics = await promClient.register.getMetricsAsJSON();

    // TODO Validate

    return {
      spansCount: allSpans.length,
      metricsCount: allMetrics.length,
      metrics: allMetrics,
    };
  }
}

const validator = new Validator();
module.exports = validator;
