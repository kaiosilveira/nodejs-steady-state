import { ManagedRedisClient, RedisClient } from '.';
import Logger from '../../../../application/observability/logger';

describe('ManagedRedisClient', () => {
  const logger = { error: jest.fn(), info: jest.fn() } as unknown as Logger;
  const fakeLRangeFn = jest.fn();
  const fakeLPushFn = jest.fn();
  const fakeExpireAtFn = jest.fn();

  const fakeRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    lPush: fakeLPushFn,
    expireAt: fakeExpireAtFn,
    lRange: fakeLRangeFn,
  } as unknown as RedisClient;

  afterEach(() => {
    fakeLRangeFn.mockReset();
    fakeLPushFn.mockReset();
    fakeExpireAtFn.mockReset();
  });

  describe('connect', () => {
    it('should initiate a connection with the Redis server', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.connect();
      expect(fakeRedisClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from the Redis server', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.disconnect();
      expect(fakeRedisClient.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('set', () => {
    it('should throw an error if key is empty', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await expect(async () => await db.set('', { key: 'value' }, 10)).rejects.toThrow(
        'Invalid key. Expected a non-empty string.'
      );
    });

    it('should set a new key with the specified expire time', async () => {
      const EXPIRE_TIME_IN_SECONDS = 60;
      const key = 'my:key';
      const value = { key: 'value' };

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.set(key, value, EXPIRE_TIME_IN_SECONDS);

      expect(fakeRedisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value), {
        EX: EXPIRE_TIME_IN_SECONDS,
      });
    });
  });

  describe('get', () => {
    it('should throw an error if key is empty', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await expect(async () => await db.get('')).rejects.toThrow(
        'Invalid key. Expected a non-empty string.'
      );
    });

    it('should return undefined if the key is not parsable', async () => {
      jest.spyOn(fakeRedisClient, 'get').mockResolvedValue(null);

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      const result = await db.get('key');

      expect(result).toEqual(undefined);
    });

    it('should get the value for a given key, parsing it to the specified type', async () => {
      const value = { key: 'value' };
      jest.spyOn(fakeRedisClient, 'get').mockResolvedValue(JSON.stringify(value));

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      const result = await db.get<typeof value>('key');

      expect(result).toEqual(value);
    });
  });

  describe.skip('addToList', () => {
    it('should throw an error if key is empty', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await expect(async () => await db.addToList('', { key: 'value' })).rejects.toThrow(
        'Invalid key. Expected a non-empty string.'
      );
    });

    it('should create a key containing a list of items with a specified expire time', async () => {
      const key = 'my:key';
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });

      await db.addToList(key, { key: 'value1' }, { key: 'value2' });

      expect(fakeLPushFn).toHaveBeenCalledWith(key, [
        JSON.stringify({ key: 'value1' }),
        JSON.stringify({ key: 'value2' }),
      ]);
    });
  });

  describe('getList', () => {
    it('should throw an error if key is empty', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await expect(async () => await db.getList('')).rejects.toThrow(
        'Invalid key. Expected a non-empty string.'
      );
    });

    it('should retrieve all items for a given list', async () => {
      const storedData = [JSON.stringify({ key: 'value1' }), JSON.stringify({ key: 'value2' })];
      fakeLRangeFn.mockResolvedValue(storedData);

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      const result = await db.getList('my:key');

      expect(result).toEqual(storedData.map(d => JSON.parse(d)));
      expect(fakeLRangeFn).toHaveBeenCalledWith('my:key', 0, -1);
    });
  });
});
