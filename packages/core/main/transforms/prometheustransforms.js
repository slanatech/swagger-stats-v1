/*
 * UBook: Prometheus transforms. Convert prometheus data to various other formats.
 */
const { pathOr } = require('ramda');

class PrometheusTransforms {
  constructor() {
    // TODO
  }

  // TODO During normalization, apply ordering of the series
  // For bucket series - ones with "le" label - put le at the end of series name, and order from low to +inf
  // This way related bucket series will be nearby, and will be shown better on multi-series charts

  // TODO Optimize normalized format.
  // TODO metricValues, instead of objects, should just contain arrays, with values ordered by timestamp ascending

  // Standard normalization of Prometheus data
  /* Returns:
   {
     metrics: ['Metric1','Metric2',...], // All found metrics  
     metricsValues: [ {ts1:v1, ts2:v2 }, {ts2:v3}, {} ], // All found values for each metric
     timestamps: [ts1,ts2] // Sorted timestamps with filled gaps, if any 
    }
  */
  normalize(prometheusData, start, end, step) {
    let emptyResult = {
      metrics: [],
      metricsDefs: [],
      metricsValues: [],
      timestamps: [],
    };

    // TODO Analyze resultType
    if (pathOr(null, ['resultType'], prometheusData) !== 'matrix') {
      return emptyResult;
    }

    if (!Array.isArray(prometheusData.result) || prometheusData.result.length < 0) {
      return emptyResult;
    }

    let metricsMap = [];
    let metricsDefs = [];
    let metricsValuesMap = [];
    let timestampsSet = new Set();

    for (let i = 0; i < prometheusData.result.length; i++) {
      let resultEntry = prometheusData.result[i];
      let metricName = Object.keys(resultEntry.metric)
        .map((x) => `${x}=${resultEntry.metric[x]}`)
        .join(',');

      metricsMap.push(metricName);
      metricsDefs.push(resultEntry.metric);
      metricsValuesMap.push({});

      let metricValues = pathOr([], ['values'], resultEntry);

      for (let j = 0; j < metricValues.length; j++) {
        let valueEntry = metricValues[j];
        let ts = valueEntry[0] * 1000;
        let val = parseFloat(valueEntry[1]);
        timestampsSet.add(ts);
        // Set this metric value at this timestamp
        metricsValuesMap[i][ts] = val;
      }
    }

    // Sort timestamps in ascending order
    let timestampsList = Array.from(timestampsSet);
    timestampsList.sort(function (a, b) {
      return a - b;
    });

    // [3,4,5,8,9]
    // to
    // [1,2,3,4,5,6,7,8,9]

    // Account for missing data: rebuild timestamps list, filling the gaps, if any
    let timestampsFilled = [];
    let curridx = 0;
    let startms = start * 1000;
    let endms = end * 1000;
    let stepms = step * 1000;
    for (let currts = startms; currts < endms; currts += stepms) {
      let pts = curridx < timestampsList.length ? timestampsList[curridx] : 0;
      if (Math.abs(currts - pts) > step) {
        timestampsFilled.push(currts);
      } else {
        timestampsFilled.push(pts);
        curridx++;
      }
    }

    return {
      metrics: metricsMap, // All found metrics
      metricsDefs: metricsDefs, // TODO reconsider
      metricsValues: metricsValuesMap, // All found values for each metric
      timestamps: timestampsFilled, // Sorted timestamps with filled gaps, if any
    };
  }

  // TODO Reconsider name
  // Convert prometheus result to data format understood by Dygraphs:
  // {
  //   labels: [Date,<Metric Name 1>, <Metric Name 2>, ...]
  //   data: [Date1,<Metric Value 1>,<Metric Value 2>, ...]
  // }
  toDygraphs(prometheusData, start, end, step) {
    let result = { labels: [], data: [] };

    const { metrics, metricsValues, timestamps } = this.normalize(prometheusData, start, end, step);

    let resultEntries = timestamps.map((x) => {
      let dataEntry = [new Date(x)];
      metrics.map((m, idx) => {
        let mv = x in metricsValues[idx] ? metricsValues[idx][x] : null;
        dataEntry.push(mv);
      });
      return dataEntry;
    });

    result.labels = metrics;
    result.labels.unshift('Date');
    result.data = resultEntries;

    return result;
  }

  // Convert to cell data format
  toCellData(prometheusData, start, end, step) {
    let result = {
      metrics: [], // All metrics in dataset
      timestamps: [], // Sorted and filled timestamps
      data: [], // Values for each metric, array of vectors
    };

    const { metrics, metricsValues, timestamps } = this.normalize(prometheusData, start, end, step);

    result.metrics = metrics;
    result.timestamps = timestamps;

    metrics.map((m, idx) => {
      let metricVector = timestamps.map((x) => {
        return x in metricsValues[idx] ? metricsValues[idx][x] : null;
      });
      result.data.push(metricVector);
    });

    return result;
  }
}

let prometheusTransforms = new PrometheusTransforms();
module.exports = prometheusTransforms;
