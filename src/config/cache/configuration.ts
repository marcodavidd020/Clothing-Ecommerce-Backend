import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  host: process.env.CACHE_HOST || 'localhost',
  port: parseInt(process.env.CACHE_PORT || '6379', 10),
  ttl: parseInt(process.env.CACHE_TTL || '5', 10),
  max: parseInt(process.env.CACHE_MAX || '10', 10),
  isGlobal: process.env.CACHE_IS_GLOBAL === 'true',
}));
