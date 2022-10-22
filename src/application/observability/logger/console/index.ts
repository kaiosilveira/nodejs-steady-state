import Logger from '..';

export default class ConsoleLogger implements Logger {
  info(args: Object): void {
    console.log(JSON.stringify({ ...args, at: new Date().toISOString() }));
  }
  warn(args: Object): void {
    console.warn(JSON.stringify({ ...args, at: new Date().toISOString() }));
  }
  error(args: Object): void {
    console.error(JSON.stringify({ ...args, at: new Date().toISOString() }));
  }
}
