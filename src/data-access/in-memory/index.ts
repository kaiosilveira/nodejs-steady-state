export default interface InMemoryDatabase {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: Object, expireTimeInSeconds: number): Promise<void>;
  addToList(key: string, ...values: Array<Object>): Promise<void>;
}
