/*
 * Prometheus Metrics
 */

const METRICS = Object.freeze({
  m1: { name: '{prefix}_aa', help: 'Some counter', type: 'counter', labelNames: [] },
  m2: { name: '{prefix}_bb', help: 'Some gauge', type: 'gauge', labelNames: [] },
});

module.exports = {
  METRICS,
};
