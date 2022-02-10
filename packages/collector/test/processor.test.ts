import processor from '../main/processor';
import matcher from '../main/matcher';
import spanBatches from './data/spanbatches.json';
import validator from '../main/validator';
import { SwsSpan } from '@swaggerstats/core';
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
    logger.info(`Wating for 15 sec ...`);
    await pause(15000);
  });

  it('Should validate results', async () => {
    logger.info(`Validating results ...`);
    const validateResult = await validator.validate();
    expect(validateResult.success).toBeTruthy();
    //expect(true).toBeTruthy();
  });
});
