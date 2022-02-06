//import { pathOr } from 'ramda';
import Redis from 'ioredis';

import { getLogger } from '@swaggerstats/core';
const logger = getLogger('REDIS');

// TODO Support cluster mode
export class RedisClient {
  //public client: Redis.Redis | Redis.ClusterStatic;
  public client: Redis.Redis;

  constructor(options: any) {
    this.client = new Redis(options);
    this.init(options);
  }

  init(options: any) {
    this.client.on('error', (err) => {
      logger.error(`error: ${err.code} ${JSON.stringify(err)}`);
      //this.status = 'fail';
    });

    this.client.on('connect', () => {
      logger.info('connect');
    });

    this.client.on('ready', () => {
      logger.info('ready');
    });

    this.client.on('end', function () {
      logger.info('end');
    });

    this.client.on('close', function () {
      logger.info('close');
    });

    logger.info(`Redis initialized: ${JSON.stringify(options)}`);
  }

  connected(): Promise<void> {
    return new Promise((resolve) => {
      logger.info(`current state: ?`);
      this.client.once('ready', () => {
        resolve();
      });
    });
  }
}
