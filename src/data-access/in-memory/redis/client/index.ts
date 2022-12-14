import { createClient } from 'redis';

import InMemoryDatabase from '../..';
import Logger from '../../../../application/observability/logger';

export type RedisClient = ReturnType<typeof createClient>;

export class ManagedRedisClient implements InMemoryDatabase {
  private readonly _client: RedisClient;
  private readonly _logger: Logger;

  constructor({ redisClient, logger }: { redisClient: RedisClient; logger: Logger }) {
    this._client = redisClient;
    this._logger = logger;
  }

  async connect(): Promise<void> {
    this._client.on('error', (err: Error) =>
      this._logger.error({ message: 'Redis Client Error', errMsg: err.message, stack: err.stack })
    );

    await this._client.connect();
    this._logger.info({ message: 'Redis connected' });
  }

  async disconnect(): Promise<void> {
    await this._client.disconnect();
  }

  async get<T>(key: string): Promise<T | undefined> {
    this._validateKey(key);

    const retrievedValueAsStr = await this._client.get(key);
    if (!retrievedValueAsStr) return undefined;

    const retrievedValue = JSON.parse(retrievedValueAsStr);
    return retrievedValue as T;
  }

  async set(key: string, value: Object, expireTimeInSeconds: number): Promise<void> {
    this._validateKey(key);
    await this._client.set(key, JSON.stringify(value), {
      EX: expireTimeInSeconds,
    });
  }

  async addToList(key: string, ...values: Object[]): Promise<void> {
    this._validateKey(key);
    const stringifiedValues = values.map(v => JSON.stringify(v));
    await Promise.all(stringifiedValues.map(v => this._client.lPush(key, v)));
  }

  async getList(key: string): Promise<Object[]> {
    this._validateKey(key);

    const valuesAsStrArr = await this._client.lRange(key, 0, -1);
    return valuesAsStrArr?.map(v => JSON.parse(v));
  }

  async popItemFromList(key: string): Promise<Object | undefined> {
    const item = await this._client.lPop(key);
    console.log('item to be popped is ', item);
    if (!item) return undefined;
    return JSON.parse(item);
  }

  async execTransaction({
    key,
    transactionBlock,
  }: {
    key: string;
    transactionBlock: Function;
  }): Promise<void> {
    await this._client.executeIsolated(async transactionClient => {
      await transactionClient.watch(key);
      const multi = transactionClient.multi();
      try {
        await transactionBlock({ multi, transactionClient });
        await multi.exec();
      } catch (ex) {
        this._logger.error({
          message: 'an error has occurred while processing the transaction',
          ex,
        });
        multi.discard();
      }
    });
  }

  private _validateKey(key: string): void {
    if (!key) throw new Error('Invalid key. Expected a non-empty string.');
  }
}
