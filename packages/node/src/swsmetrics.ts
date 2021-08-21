/* swagger-stats
 * Prometheus metrics
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as promClient from 'prom-client';
//const debug = require('debug')('sws:metrics');

// TODO REFACTOR

/* swagger-stats Prometheus metrics */
export class SwsMetrics {
  public coreMetricsDefs: any;
  public systemMetricsDefs: any;
  public apiMetricsDefs: any;

  constructor() {
    // Core API Metrics
    this.coreMetricsDefs = {
      api_all_request_total: {
        type: 'counter',
        help: 'The total number of all API requests received',
      },
      api_all_success_total: {
        type: 'counter',
        help: 'The total number of all API requests with success response',
      },
      api_all_errors_total: {
        type: 'counter',
        help: 'The total number of all API requests with error response',
      },
      api_all_client_error_total: {
        type: 'counter',
        help: 'The total number of all API requests with client error response',
      },
      api_all_server_error_total: {
        type: 'counter',
        help: 'The total number of all API requests with server error response',
      },
      api_all_request_in_processing_total: {
        type: 'gauge',
        help: 'The total number of all API requests currently in processing (no response yet)',
      },
    };

    // System metrics for node process
    this.systemMetricsDefs = {
      nodejs_process_memory_rss_bytes: {
        type: 'gauge',
        help: 'Node.js process resident memory (RSS) bytes ',
      },
      nodejs_process_memory_heap_total_bytes: {
        type: 'gauge',
        help: 'Node.js process memory heapTotal bytes',
      },
      nodejs_process_memory_heap_used_bytes: {
        type: 'gauge',
        help: 'Node.js process memory heapUsed bytes',
      },
      nodejs_process_memory_external_bytes: {
        type: 'gauge',
        help: 'Node.js process memory external bytes',
      },
      nodejs_process_cpu_usage_percentage: {
        type: 'gauge',
        help: 'Node.js process CPU usage percentage',
      },
    };

    this.apiMetricsDefs = {
      // API Operation counters, labeled with method, path and code
      api_request_total: {
        type: 'counter',
        help: 'The total number of all API requests',
        labelNames: ['method', 'path', 'code'],
      },

      // API request duration histogram, labeled with method, path and code
      api_request_duration_milliseconds: {
        type: 'histogram',
        help: 'API requests duration',
        labelNames: ['method', 'path', 'code'],
      },

      // API request size histogram, labeled with method, path and code
      api_request_size_bytes: {
        type: 'histogram',
        help: 'API requests size',
        labelNames: ['method', 'path', 'code'],
      },

      // API response size histogram, labeled with method, path and code
      api_response_size_bytes: {
        type: 'histogram',
        help: 'API requests size',
        labelNames: ['method', 'path', 'code'],
      },
    };
  }

  // Create Prometheus metrics based on passed definition
  getPrometheusMetrics(prefix: string, metricDefs: any) {
    const allMetrics: any = {};
    for (const metricId of Object.keys(metricDefs)) {
      const metricDef = metricDefs[metricId];
      let metric = null;
      const metricConfig = {
        name: prefix + metricId,
        help: metricDef.help,
        labelNames: [],
        buckets: [],
      };
      if ('labelNames' in metricDef) {
        metricConfig.labelNames = metricDef.labelNames;
      }
      if ('buckets' in metricDef) {
        metricConfig.buckets = metricDef.buckets;
      }
      switch (metricDef.type) {
        case 'counter': {
          metric = new promClient.Counter(metricConfig);
          break;
        }
        case 'gauge': {
          metric = new promClient.Gauge(metricConfig);
          break;
        }
        case 'histogram': {
          metric = new promClient.Histogram(metricConfig);
          break;
        }
      }
      allMetrics[metricId] = metric;
    }
    return allMetrics;
  }

  clearPrometheusMetrics(metrics: any) {
    for (const metricId of Object.keys(metrics)) {
      const metric = metrics[metricId];
      promClient.register.removeSingleMetric(metric.name);
      delete metrics[metricId];
    }
  }
}
