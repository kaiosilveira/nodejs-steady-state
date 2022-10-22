import http from 'http';
import * as Redis from 'redis';

import ExpressAppFactory from './presentation/express';
import ConsoleLogger from './application/observability/logger/console';
import { ManagedRedisClient } from './data-access/in-memory/redis/client';
import MongoDBConnectionFactory from './data-access/disk/mongodb/connection-factory';
import InMemoryApplicationState from './presentation/application-state/in-memory';

const appState = new InMemoryApplicationState();
const logger = new ConsoleLogger({ appState });

const { APP_PORT, REDIS_PORT, MONGODB_PORT } = process.env;
const env = {
  APP_PORT: Number(APP_PORT) || 8080,
  REDIS_PORT: Number(REDIS_PORT),
  MONGODB_PORT: Number(MONGODB_PORT),
};

run();

async function run() {
  const redisClient = new ManagedRedisClient({
    logger,
    redisClient: Redis.createClient({ url: `redis://redis:${env.REDIS_PORT}` }),
  });

  await redisClient.connect();

  const diskDbConn = new MongoDBConnectionFactory({ logger }).createConnection({
    url: 'mongodb://mongodb',
  });

  const app = ExpressAppFactory.createApp({
    appState,
    inMemoryDatabaseClient: redisClient,
    diskDatabaseConnection: diskDbConn,
    logger,
  });

  http.createServer(app.instance).listen(env.APP_PORT, async () => {
    logger.info({ message: `server listening at ${env.APP_PORT} 🚀` });

    appState.setReady(true);

    process.on('SIGINT', async () => {
      logger.info({ message: 'closing in-memory db connection...' });
      await redisClient.disconnect();
      logger.info({ message: 'in-memory db connection closed' });

      logger.info({ message: 'closing disk-db connection...' });
      await diskDbConn.close();
      logger.info({ message: 'disk-db connection closed' });

      process.exit(0);
    });
  });
}
