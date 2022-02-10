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
    logger.info(`Validating: getting all spans ...`);
    const allSpans = await matcher.getAll();
    logger.info(`Validating ${allSpans.length} received spans`);
    //monitor.inc('spans_processed_total');
    const allMetrics = await promClient.register.getMetricsAsJSON();
    logger.info(`Got metrics: ${JSON.stringify(allMetrics)}`);

    // TODO Validate

    return {
      success: false,
      spansCount: allSpans.length,
      metricsCount: allMetrics.length,
      metrics: allMetrics,
    };
  }
}

const validator = new Validator();
module.exports = validator;
