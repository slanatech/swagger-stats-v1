/*
 * Prometheus Metrics
 */

const METRICS = Object.freeze({
  // Generic metrics
  spans_processed_total: { name: '{prefix}_spans_processed_total', help: 'Total processed spans', type: 'counter', labelNames: [] },
  service_spans_processed_total: { name: '{prefix}_service_spans_processed_total', help: 'Processed spans per service', type: 'counter', labelNames: ['service'] },
  // Experimental
  service_spans_total: { name: '{prefix}_service_spans_total', help: 'Processed spans per service', type: 'counter', labelNames: ['service', 'kind', 'success'] },
  // Volume
  service_calls_total: { name: '{prefix}_service_calls_total', help: 'Total calls between services', type: 'counter', labelNames: ['src', 'dst'] },
});

module.exports = {
  METRICS,
};
