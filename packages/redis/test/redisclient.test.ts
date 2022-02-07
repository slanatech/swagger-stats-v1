import { RedisClient } from '../src';

//const path = require('path');
//const { pathOr } = require('ramda');

const redisURL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';

const redis = new RedisClient(redisURL);

describe('RedisClient Test', function () {
  it('Should connect to Redis', async () => {
    await redis.connected();
  });

  it('Should set key', async () => {
    await redis.client.set('key', 'value');
  });

  it('Should get key', async () => {
    const v = await redis.client.get('key');
    expect(v === 'value').toBeTruthy();
  });
});
