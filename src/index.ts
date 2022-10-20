import http from 'http';
import { createClient } from 'redis';
import ExpressAppFactory from './presentation/express';

const PORT = Number(process.env.PORT) || 3000;
const app = ExpressAppFactory.createApp();

http.createServer(app).listen(PORT, async () => {
  console.log(`server listening at ${PORT} 🚀`);

  setTimeout(async () => {
    const client = createClient({ url: 'redis://redis:6379' });
    client.on('error', err => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('key', 'value');
    const value = await client.get('key');

    console.log(`value retrieved from redis cache: ${value}`);
  }, 5000);
});
