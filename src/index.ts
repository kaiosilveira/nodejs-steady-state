import http from 'http';
import * as Redis from 'redis';
import Mongoose from 'mongoose';
import ExpressAppFactory from './presentation/express';

const PORT = Number(process.env.PORT) || 8080;
const app = ExpressAppFactory.createApp();

http.createServer(app.instance).listen(PORT, async () => {
  console.log(`server listening at ${PORT} 🚀`);

  const redisClient = Redis.createClient({ url: 'redis://redis:6379' });
  redisClient.on('error', err => console.log('Redis Client Error', err));

  await redisClient.connect();
  console.log('Redis connected');

  const mongodbConn = Mongoose.createConnection('mongodb://mongodb');
  mongodbConn.on('connected', () => console.log('MongoDB connected'));
});
