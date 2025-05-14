import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

// Cargar variables de entorno
config();

// Crear instancia del servicio de configuración
const configService = new ConfigService();

// Ambiente de ejecución
const isProduction = configService.get('NODE_ENV') === 'production';

// Configuración para migraciones y CLI de TypeORM
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get<number>('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USERNAME'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DATABASE'),
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false, // Nunca true en producción
  logging: isProduction ? ['error'] : ['error', 'warn', 'migration', 'schema'],
  migrationsRun: false,
  // Opciones adicionales para producción
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  cache: isProduction,
});

export default dataSource;
