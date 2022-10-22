import InMemoryDatabase from '..';

export default class FakeInMemoryDatabase implements InMemoryDatabase {
  execTransaction({
    key,
    transactionBlock,
  }: {
    key: string;
    transactionBlock: Function;
  }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  get<T>(key: string): Promise<T | undefined> {
    throw new Error('Method not implemented.');
  }

  set(key: string, value: Object, expireTimeInSeconds: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addToList(key: string, ...values: Object[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getList(key: string): Promise<Object[]> {
    throw new Error('Method not implemented.');
  }
}
