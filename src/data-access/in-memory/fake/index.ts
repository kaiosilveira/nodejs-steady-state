import InMemoryDatabase from '..';

export default class FakeInMemoryDatabase implements InMemoryDatabase {
  get<T>(key: string): Promise<T | undefined> {
    throw new Error('Method not implemented.');
  }
  set(key: string, value: Object, expireTimeInSeconds: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  addToList(key: string, ...values: Object[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
