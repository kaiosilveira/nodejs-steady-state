import { Request, Response } from 'express';
import Logger from '../../../application/observability/logger';

export default class OutgoingResponseMiddleware {
  _logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
    this.hook = this.hook.bind(this);
  }

  hook(req: Request, res: Response, next: Function): void {
    res.on('finish', () => {
      const ctx = req.context;

      const durationMs = +new Date() - (ctx?.reqStartedAt ?? 0);
      this._logger.info({
        message: `${ctx?.method.toUpperCase()} ${ctx?.url} ${res.statusCode} (${durationMs}ms)`,
        status: res.statusCode,
        durationMs,
        ...req.context,
      });
    });

    next();
  }
}
