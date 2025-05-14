import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => ({
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
  maxConnections: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '100', 10),
  connectionTimeout: parseInt(
    process.env.POSTGRES_CONNECTION_TIMEOUT || '10000',
    10,
  ),
}));
