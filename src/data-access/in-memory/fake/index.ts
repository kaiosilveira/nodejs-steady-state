import InMemoryDatabase from '..';

export default class FakeInMemoryDatabase implements InMemoryDatabase {
  execTransaction(_args: { key: string; transactionBlock: Function }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  get<T>(_key: string): Promise<T | undefined> {
    throw new Error('Method not implemented.');
  }

  set(_key: string, _value: Object, _expireTimeInSeconds: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addToList(_key: string, ..._values: Object[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getList(_key: string): Promise<Object[]> {
    throw new Error('Method not implemented.');
  }
}
