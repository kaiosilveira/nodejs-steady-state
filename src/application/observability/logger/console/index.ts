import Logger from '..';
import ApplicationState from '../../../../presentation/application-state';

export default class ConsoleLogger implements Logger {
  private readonly _appState: ApplicationState;

  constructor({ appState }: { appState: ApplicationState }) {
    this._appState = appState;
  }

  info(args: Object): void {
    console.log(
      JSON.stringify({ ...args, at: new Date().toISOString(), appReady: this._appState.isReady() })
    );
  }
  warn(args: Object): void {
    console.warn(
      JSON.stringify({ ...args, at: new Date().toISOString(), appReady: this._appState.isReady() })
    );
  }
  error(args: Object): void {
    console.error(
      JSON.stringify({ ...args, at: new Date().toISOString(), appReady: this._appState.isReady() })
    );
  }
}
