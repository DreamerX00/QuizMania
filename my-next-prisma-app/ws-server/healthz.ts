import { redisClient } from './config/redis';
import { Express } from 'express';

export function registerHealthEndpoint(app: Express) {
  // Health endpoint for Docker health checks
  app.get('/health', async (_req, res) => {
    try {
      await redisClient.ping();
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        services: {
          redis: 'connected'
        }
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        services: {
          redis: 'disconnected'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Legacy healthz endpoint
  app.get('/healthz', async (_req, res) => {
    try {
      await redisClient.ping();
      res.status(200).send('ok');
    } catch {
      res.status(500).send('redis unavailable');
    }
  });
} 