/*
 * Validate that all received spans were correctly processed
 * // TODO move to tests
 */

//const { pathOr } = require('ramda');
const logger = require('./logger')('VALIDATOR');
const matcher = require('./matcher');
const promClient = require('prom-client');
const monitor = require('./monitor');

// TEMP
const allM = [
  {
    help: 'Total processed spans',
    name: 'sws_spans_processed_total',
    type: 'counter',
    values: [
      {
        value: 130,
        labels: {},
      },
    ],
    aggregator: 'sum',
  },
  {
    help: 'Processed spans per service',
    name: 'sws_service_spans_processed_total',
    type: 'counter',
    values: [
      {
        value: 1,
        labels: {
          service: 'hapitest',
        },
      },
      {
        value: 98,
        labels: {
          service: 'petclinic',
        },
      },
      {
        value: 31,
        labels: {
          service: 'spectest-service',
        },
      },
    ],
    aggregator: 'sum',
  },
  {
    help: 'Processed spans per service',
    name: 'sws_service_spans_total',
    type: 'counter',
    values: [
      {
        value: 1,
        labels: {
          service: 'hapitest',
          kind: 'client',
          success: true,
        },
      },
      {
        value: 94,
        labels: {
          service: 'petclinic',
          kind: 'client',
          success: true,
        },
      },
      {
        value: 25,
        labels: {
          service: 'spectest-service',
          kind: 'internal',
          success: true,
        },
      },
      {
        value: 2,
        labels: {
          service: 'spectest-service',
          kind: 'server',
          success: true,
        },
      },
      {
        value: 3,
        labels: {
          service: 'spectest-service',
          kind: 'server',
          success: false,
        },
      },
      {
        value: 3,
        labels: {
          service: 'petclinic',
          kind: 'internal',
          success: true,
        },
      },
      {
        value: 1,
        labels: {
          service: 'petclinic',
          kind: 'server',
          success: true,
        },
      },
      {
        value: 1,
        labels: {
          service: 'spectest-service',
          kind: 'client',
          success: true,
        },
      },
    ],
    aggregator: 'sum',
  },
  {
    help: 'Total calls between services',
    name: 'sws_service_calls_total',
    type: 'counter',
    values: [
      {
        value: 5,
        labels: {
          src: 'external',
          dst: 'spectest-service',
        },
      },
      {
        value: 1,
        labels: {
          src: 'spectest-service',
          dst: 'petclinic',
        },
      },
    ],
    aggregator: 'sum',
  },
];

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

  metricsToObj(allMetrics) {
    if (!Array.isArray(allMetrics) || allMetrics.length <= 0) {
      return {};
    }
    const result = {};
    allMetrics.map((m) => {
      const n = m.name;
      const vo = {};
      const vals = m.values;
      vals.map((v) => {
        let lkey = JSON.stringify(v.labels);
        lkey = lkey.replaceAll('"', '');
        vo[lkey] = v.value;
      });
      result[n] = vo;
    });
    return result;
  }

  getExpectedMetricsObj(allSpans) {
    if (!Array.isArray(allSpans) || allSpans.length <= 0) {
      return {};
    }
    const result = {
      sws_spans_processed_total: {},
      sws_service_calls_total: {},
    };
    result['sws_spans_processed_total']['{}'] = allSpans.length;
    const spansIndex = {};
    allSpans.map((s) => {
      spansIndex[s.spanId] = s;
    });
    // Calculate sws_service_calls_total
    // we have all spans known, so we can just analyze server spans and check if it has parent ot not
    const labels = {};
    allSpans.map((s) => {
      if (s.kind === 'server') {
        const parent = s.parentSpanId ? spansIndex[s.parentSpanId] || null : null;
        let keySrcDst = `{src:${parent ? parent.service : 'external'},dst:${s.service}}`;
        labels[keySrcDst] = (labels[keySrcDst] || 0) + 1;
      }
    });
    result['sws_service_calls_total'] = labels;
    return result;
  }

  async getActualMetricsObj() {
    const allMetrics = await promClient.register.getMetricsAsJSON();
    return this.metricsToObj(allMetrics);
  }

  async validateTest() {
    const allMetrics = allM;
    const metrics = this.metricsToObj(allMetrics);
    return true;
  }
}

const validator = new Validator();
module.exports = validator;
