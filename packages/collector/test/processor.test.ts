import * as processor from '../main/processor';
import matcher from '../main/matcher';
import * as spanBatches from './data/spanbatches.json';
import { SwsSpan } from '@swaggerstats/core';

//const path = require('path');
//const { pathOr } = require('ramda');

describe('Processor Test', function () {
  it('Should initialize', async () => {
    expect((await matcher.getAll()).length === 0).toBeTruthy();
  });
  it('Should submit span batches to processor', async () => {
    for (const spanBatch of spanBatches) {
      //const delay = spanBatch.delay;
      const spansJSON = spanBatch.batch;
      const spans = spansJSON.map((x) => {
        return Object.assign(new SwsSpan(), x);
      });
      await processor.processSpans(spans);
    }
  });
});
