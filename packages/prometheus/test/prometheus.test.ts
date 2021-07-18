import { Prometheus } from '../src';

//const path = require('path');
//const { pathOr } = require('ramda');

const { DataSource } = require('@swaggerstats/core');

const prometheusURL = process.env.TEST_PROMETHEUS_URL || 'http://localhost:9090';

const prometheus = new Prometheus();

describe('Prometheus Plugin Test', function () {
  it('Should instantiate Prometheus plugin', async () => {
    await prometheus.init();
  });

  it('Should register Prometheus data source', async () => {
    const ds = new DataSource({
      id: '1',
      type: 'prometheus',
      settings: {
        url: prometheusURL,
      },
    });

    const testResult = await prometheus.testDataSource(ds);
    expect(testResult.success).toBeTruthy();

    const registerResult = await prometheus.registerDataSource(ds);
    expect(registerResult.success).toBeTruthy();
  });

  it('Should get labels', async () => {
    const labelsResult = await prometheus.request({
      op: 'labels',
      ds: '1',
    });
    expect(labelsResult.success).toBeTruthy();
    expect(labelsResult.data).toEqual(expect.arrayContaining(['__name__']));
  });

  it('Should get metrics', async () => {
    const metricsResult = await prometheus.request({
      op: 'metrics',
      ds: '1',
    });
    expect(metricsResult.success).toBeTruthy();
    expect(metricsResult.data).toEqual(expect.arrayContaining(['up']));
  });

  it('Should get labels values', async () => {
    const labelValuesResult = await prometheus.request({
      op: 'labelvalues',
      ds: '1',
      label: 'job',
    });
    expect(labelValuesResult.success).toBeTruthy();
    expect(labelValuesResult.data).toEqual(expect.arrayContaining(['prometheus']));
  });

  it('Should get series', async () => {
    const endTs = Math.floor(Date.now() / 1000);
    const seriesResult = await prometheus.request({
      op: 'series',
      ds: '1',
      match: ['up'],
      start: endTs - 60 * 60,
      end: endTs,
    });
    expect(seriesResult.success).toBeTruthy();
    expect(seriesResult.data).toEqual(
      expect.arrayContaining([
        {
          __name__: 'up',
          instance: 'localhost:9090', // ???
          job: 'prometheus',
        },
      ])
    );
  });

  it('Should execute instant query', async () => {
    const qResult = await prometheus.query({
      ds: '1',
      query: 'up',
    });
    expect(qResult.success).toBeTruthy();
    expect(qResult.data.resultType).toEqual('vector');

    expect(Array.isArray(qResult.data.result)).toBeTruthy();
    let upEntry = null;
    for (const entry of qResult.data.result) {
      if (entry.metric.__name__ === 'up' && entry.metric.job === 'prometheus') {
        upEntry = entry;
      }
    }
    expect(upEntry !== null).toBeTruthy();
    expect(Array.isArray(upEntry.value)).toBeTruthy();
    expect(upEntry.value[1]).toEqual('1');
  });

  it('Should execute instant query with time', async () => {
    const timeVal = Math.floor(Date.now() / 1000);
    const qResult = await prometheus.query({
      ds: '1',
      query: 'up',
      time: timeVal,
    });
    expect(qResult.success).toBeTruthy();
    expect(qResult.data.resultType).toEqual('vector');

    expect(Array.isArray(qResult.data.result)).toBeTruthy();
    let upEntry = null;
    for (const entry of qResult.data.result) {
      if (entry.metric.__name__ === 'up' && entry.metric.job === 'prometheus') {
        upEntry = entry;
      }
    }
    expect(upEntry !== null).toBeTruthy();
    expect(Array.isArray(upEntry.value)).toBeTruthy();
    expect(upEntry.value[1]).toEqual('1');
  });

  // TODO wait 5 seconds ?
  it('Should execute range query', async () => {
    const timeEnd = Math.floor(Date.now() / 1000);
    const qResult = await prometheus.query({
      ds: '1',
      query: 'up',
      start: timeEnd - 5,
      end: timeEnd,
      step: 1,
    });

    expect(qResult.success).toBeTruthy();
    expect(qResult.data.resultType).toEqual('matrix');

    expect(Array.isArray(qResult.data.result)).toBeTruthy();
    let upEntry = null;
    for (const entry of qResult.data.result) {
      if (entry.metric.__name__ === 'up' && entry.metric.job === 'prometheus') {
        upEntry = entry;
      }
    }
    expect(upEntry !== null).toBeTruthy();
    expect(Array.isArray(upEntry.values)).toBeTruthy();
    expect(upEntry.values[0][1]).toEqual('1');
  });
});
