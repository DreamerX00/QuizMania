import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});

// SLO metrics hooks (to be extended for Prometheus)
export const sloMetrics = {
  recordLatency: (event: string, ms: number) => {
    // Integrate with Prometheus here
    logger.debug({ event, ms }, 'SLO latency recorded');
  },
  recordError: (event: string) => {
    // Integrate with Prometheus here
    logger.warn({ event }, 'SLO error recorded');
  }
}; 