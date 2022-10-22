import http from 'http';
import * as Redis from 'redis';

import ExpressAppFactory from './presentation/express';
import ConsoleLogger from './application/observability/logger/console';
import { ManagedRedisClient } from './data-access/in-memory/redis/client';
import MongoDBConnectionFactory from './data-access/disk/mongodb/connection-factory';

const PORT = Number(process.env.PORT) || 8080;
const app = ExpressAppFactory.createApp();

http.createServer(app.instance).listen(PORT, async () => {
  const logger = new ConsoleLogger();

  logger.info({ message: `server listening at ${PORT} 🚀` });

  const redisClient = new ManagedRedisClient({
    logger,
    redisClient: Redis.createClient({ url: 'redis://redis:6379' }),
  });

  await redisClient.connect();

  app.attachInMemoryDbClient(redisClient);
  app.attachDiskDatabaseConnection(
    new MongoDBConnectionFactory({ logger }).createConnection({
      url: 'mongodb://mongodb',
    })
  );
});
