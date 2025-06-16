import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USERNAME || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'ecommerce',
    schema: process.env.POSTGRES_SCHEMA || 'public',
    synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
    logging: process.env.POSTGRES_LOGGING === 'true',
    ssl: process.env.POSTGRES_SSL === 'true',
    autoLoadEntities: process.env.POSTGRES_AUTO_LOAD_ENTITIES === 'true' || true,
    // Optimize connection pool for serverless environments
    maxConnections: parseInt(
      process.env.POSTGRES_MAX_CONNECTIONS || 
      (isServerless ? '5' : '20'), 
      10
    ),
    connectionTimeout: parseInt(
      process.env.POSTGRES_CONNECTION_TIMEOUT || 
      (isServerless ? '5000' : '10000'), 
      10
    ),
    // Additional serverless optimizations
    idleTimeoutMillis: parseInt(
      process.env.POSTGRES_IDLE_TIMEOUT || 
      (isServerless ? '1000' : '30000'), 
      10
    ),
    acquireTimeoutMillis: parseInt(
      process.env.POSTGRES_ACQUIRE_TIMEOUT || '5000', 
      10
    ),
  };
});
