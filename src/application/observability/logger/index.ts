export default interface Logger {
  info(args: Object): void;
  warn(args: Object): void;
  error(args: Object): void;
}
