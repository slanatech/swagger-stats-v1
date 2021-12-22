import { SwsOptions } from '../src/swsoptions';
import { SwsProcessor } from '../src/swsprocessor';
import { SwsServer } from '../src/swsserver';
import { WebSocket } from 'ws';

const swsOptions = new SwsOptions();
const swsProcessor = new SwsProcessor(swsOptions);
swsProcessor.init();
const swsServer = new SwsServer(swsOptions, swsProcessor);
let swsClient: any | null = null;

const delay = function (t: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), t);
  });
};

describe('SwsServer Test', function () {
  it('Should start server', async () => {
    swsServer.start();
    await delay(2000);
  });

  it('Client should connect over ws', async () => {
    swsClient = new WebSocket('ws://localhost:8086/sws');
    let opened = false;
    swsClient.on('open', () => {
      console.log('Connection Opened');
      opened = true;
    });
    await delay(1000);
    expect(opened).toBeTruthy();
  }, 3000);

  it.skip('Should wait', async () => {
    await delay(60000);
  }, 150000);
});
