import { redisClient } from './config/redis';
import { Express } from 'express';

export function registerHealthEndpoint(app: Express) {
  app.get('/healthz', async (_req, res) => {
    try {
      await redisClient.ping();
      res.status(200).send('ok');
    } catch {
      res.status(500).send('redis unavailable');
    }
  });
} 