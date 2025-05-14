import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  host: process.env.QUEUE_HOST || 'localhost',
  port: parseInt(process.env.QUEUE_PORT || '5672', 10),
  username: process.env.QUEUE_USERNAME || 'guest',
  password: process.env.QUEUE_PASSWORD || 'guest',
  vhost: process.env.QUEUE_VHOST || '/',
  retryAttempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000', 10),
  prefetchCount: parseInt(process.env.QUEUE_PREFETCH_COUNT || '10', 10),
  queueOptions: {
    durable: process.env.QUEUE_DURABLE !== 'false',
  },
}));
