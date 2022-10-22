import { ManagedRedisClient, RedisClient } from '.';
import Logger from '../../../../application/observability/logger';

const noop = () => {};

describe('ManagedRedisClient', () => {
  const logger = { error: jest.fn() } as unknown as Logger;
  const fakeRedisClient = {
    get: noop,
    set: noop,
    lPush: noop,
    lRange: noop,
    expireAt: noop,
    connect: noop,
    disconnect: noop,
    on: noop,
  } as unknown as RedisClient;

  describe('connect', () => {
    it('should initiate a connection with the Redis server', async () => {
      const spyOnConnect = jest.spyOn(fakeRedisClient, 'connect');

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.connect();

      expect(spyOnConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from the Redis server', async () => {
      const spyOnDisconnect = jest.spyOn(fakeRedisClient, 'disconnect');

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.disconnect();

      expect(spyOnDisconnect).toHaveBeenCalledTimes(1);
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
      const spyOnSet = jest.spyOn(fakeRedisClient, 'set').mockResolvedValue(null);
      const key = 'my:key';
      const value = { key: 'value' };

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await db.set(key, value, EXPIRE_TIME_IN_SECONDS);

      expect(spyOnSet).toHaveBeenCalledWith(key, JSON.stringify(value), {
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

  describe('addToList', () => {
    it('should throw an error if key is empty', async () => {
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      await expect(async () => await db.addToList('', 0, { key: 'value' })).rejects.toThrow(
        'Invalid key. Expected a non-empty string.'
      );
    });

    it('should create a key containing a list of items with a specified expire time', async () => {
      const EXPIRE_TIME_IN_SECONDS = 60;
      const key = 'my:key';
      const spyOnLPush = jest.spyOn(fakeRedisClient, 'lPush');
      const spyOnExpireAt = jest.spyOn(fakeRedisClient, 'expireAt');
      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });

      await db.addToList(key, EXPIRE_TIME_IN_SECONDS, { key: 'value1' }, { key: 'value2' });

      expect(spyOnLPush).toHaveBeenCalledWith(key, [
        JSON.stringify({ key: 'value1' }),
        JSON.stringify({ key: 'value2' }),
      ]);
      expect(spyOnExpireAt).toHaveBeenCalledWith(key, EXPIRE_TIME_IN_SECONDS);
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
      const spyOnLRange = jest.spyOn(fakeRedisClient, 'lRange').mockResolvedValue(storedData);

      const db = new ManagedRedisClient({ logger, redisClient: fakeRedisClient });
      const result = await db.getList('my:key');

      expect(result).toEqual(storedData.map(d => JSON.parse(d)));
      expect(spyOnLRange).toHaveBeenCalledWith('my:key', 0, -1);
    });
  });
});
