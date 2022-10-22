import Mongoose from 'mongoose';
import Logger from '../../../../application/observability/logger';

export default class MongoDBConnectionFactory {
  private readonly _logger: Logger;
  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
  }

  createConnection({ url }: { url: string }): Mongoose.Connection {
    const conn = Mongoose.createConnection(url);
    conn.on('connected', () => this._logger.info({ message: 'MongoDB connected' }));
    conn.on('disconnected', () => this._logger.info({ message: 'MongoDB disconnected' }));
    return conn;
  }
}
