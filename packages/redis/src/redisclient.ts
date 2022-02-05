import { pathOr } from 'ramda';
import Redis from 'ioredis';

import { OpResult, OpError, RestOp, DataSource, getLogger } from '@swaggerstats/core';
const logger = getLogger('REDIS');

export class RedisClient {
  public client: Redis.Redis | Redis.ClusterStatic;

  constructor(options: any) {
    this.client = new Redis(options);
    this.init(options);
  }

  init(options: any) {
    //this.client = new IORedis.Redis(options);
    // +++
    logger.info(`Redis initialized: ${r.options}`);
  }
}
