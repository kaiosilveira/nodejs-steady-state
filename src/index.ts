import http from 'http';
import * as Redis from 'redis';
import Mongoose from 'mongoose';
import ExpressAppFactory from './presentation/express';
import ConsoleLogger from './application/observability/logger/console';

const PORT = Number(process.env.PORT) || 8080;
const app = ExpressAppFactory.createApp();

http.createServer(app.instance).listen(PORT, async () => {
  const logger = new ConsoleLogger();

  logger.info({ message: `server listening at ${PORT} 🚀` });

  const redisClient = Redis.createClient({ url: 'redis://redis:6379' });
  redisClient.on('error', (err: Error) =>
    logger.info({ message: 'Redis Client Error', errMsg: err.message, stack: err.stack })
  );

  await redisClient.connect();
  logger.info('Redis connected');

  const mongodbConn = Mongoose.createConnection('mongodb://mongodb');
  mongodbConn.on('connected', () => logger.info({ message: 'MongoDB connected' }));
});
