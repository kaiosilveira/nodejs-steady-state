import http from 'http';
import { createClient } from 'redis';
import mongoose from 'mongoose';
import ExpressAppFactory from './presentation/express';

const PORT = Number(process.env.PORT) || 8080;
const app = ExpressAppFactory.createApp();

http.createServer(app).listen(PORT, async () => {
  console.log(`server listening at ${PORT} 🚀`);

  const redisClient = createClient({ url: 'redis://redis:6379' });
  redisClient.on('error', err => console.log('Redis Client Error', err));

  await redisClient.connect();
  console.log('Redis connected');

  const mongodbConn = mongoose.createConnection('mongodb://mongodb');
  mongodbConn.on('connected', () => console.log('MongoDB connected'));
});
