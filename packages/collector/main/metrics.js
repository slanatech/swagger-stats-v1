/*
 * Prometheus Metrics
 */

const METRICS = Object.freeze({
  spans_processed_total: { name: '{prefix}_spans_processed_total', help: 'Total processed spans', type: 'counter', labelNames: [] },
  spans_processed: { name: '{prefix}_spans_processed', help: 'Processed spans per service', type: 'counter', labelNames: ['service'] },
});

module.exports = {
  METRICS,
};
