import Logger from '..';

export default class FakeLogger implements Logger {
  info(args: Object): void {
    throw new Error('Method not implemented.');
  }
  warn(args: Object): void {
    throw new Error('Method not implemented.');
  }
  error(args: Object): void {
    throw new Error('Method not implemented.');
  }
}
