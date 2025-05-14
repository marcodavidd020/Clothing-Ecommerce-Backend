import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET || 'my-secret',
  resave: process.env.SESSION_RESAVE === 'true',
  saveUninitialized: process.env.SESSION_SAVE_UNINIT === 'true',
  cookie: {
    httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000', 10), // 1 día
    sameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax',
  },
  store: {
    type: process.env.SESSION_STORE_TYPE || 'memory', // memory, redis, db
    host: process.env.SESSION_STORE_HOST || 'localhost',
    port: parseInt(process.env.SESSION_STORE_PORT || '6379', 10),
    ttl: parseInt(process.env.SESSION_STORE_TTL || '86400', 10),
    db: parseInt(process.env.SESSION_STORE_DB || '0', 10),
    prefix: process.env.SESSION_STORE_PREFIX || 'sess:',
  },
}));
