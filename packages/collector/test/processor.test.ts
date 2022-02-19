import processor from '../main/processor';
import matcher from '../main/matcher';
import spanBatches from './data/spanbatches.json';
import validator from '../main/validator';
import { SwsSpan } from '@swaggerstats/core';
//import { pathOr } from 'ramda';
import { getLogger } from '@swaggerstats/core';
const logger = getLogger('processor.test.ts');

//const path = require('path');
//const { pathOr } = require('ramda');

const pause = (x: number) => new Promise((res) => setTimeout(res, x));

jest.setTimeout(2 * 60 * 1000);

describe('Processor Test', function () {
  it('Should initialize', async () => {
    expect((await matcher.getAll()).length === 0).toBeTruthy();
  });

  it.skip('Should test validator', async () => {
    const vtr = await validator.validateTest();
    expect(vtr).toBeTruthy();
  });

  it('Should submit span batches to processor', async () => {
    for (const spanBatch of spanBatches) {
      const delay = spanBatch.delay;
      if (delay > 0) {
        logger.info(`Pausing for ${delay} msec ...`);
        await pause(delay);
      }
      const spansJSON = spanBatch.batch;
      const spans = spansJSON.map((x) => {
        return Object.assign(new SwsSpan(), x);
      });
      logger.info(`Submitting ${spans.length} spans ...`);
      await processor.processSpans(spans);
    }
    logger.info(`Wating for 5 sec ...`);
    await pause(5000);
  });

  it('Should validate results', async () => {
    logger.info(`Validating results ...`);
    const allSpans = await matcher.getAll();
    const expectedMetrics: any = validator.getExpectedMetricsObj(allSpans);
    const actualMetrics: any = await validator.getActualMetricsObj();
    //expect(pathOr(null, ['sws_spans_processed_total', '{}'], expectedMetrics)).toEqual(130);
    expect(actualMetrics).toMatchObject(expectedMetrics);

    //const validateResult = await validator.validate();
    //expect(validateResult.success).toBeTruthy();
    //expect(true).toBeTruthy();
  });
});
