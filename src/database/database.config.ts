import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

/**
 * Carga las variables de entorno del archivo .env si existe.
 * Esto es útil principalmente para el contexto de la CLI de TypeORM,
 * ya que la aplicación NestJS principal podría cargar .env de otra manera (ej. a través de ConfigModule.forRoot).
 */
dotenvConfig();

/**
 * Se crea una instancia de ConfigService de @nestjs/config para acceder
 * a las variables de entorno de forma consistente y tipada.
 */
const configService = new ConfigService();

/**
 * Determina si el entorno actual es de producción basado en la variable NODE_ENV.
 */
const isProduction = configService.get('NODE_ENV') === 'production';

/**
 * Configuración de la fuente de datos (DataSource) para TypeORM.
 * Este objeto `DataSource` es utilizado específicamente por la CLI de TypeORM para tareas como:
 * - Generación de migraciones (`migration:generate`)
 * - Ejecución de migraciones (`migration:run`)
 * - Reversión de migraciones (`migration:revert`)
 *
 * La aplicación NestJS en tiempo de ejecución configura su conexión a través de `TypeOrmModule.forRootAsync`,
 * generalmente utilizando `PostgresConfigService` para obtener estos mismos valores de configuración.
 *
 * @see https://typeorm.io/data-source-options
 */
const dataSourceOptions: DataSourceOptions = {
  /**
   * Tipo de base de datos.
   * @env POSTGRES_TYPE - Opcional, por defecto 'postgres'.
   */
  type: 'postgres',
  /**
   * Host de la base de datos.
   * @env POSTGRES_HOST - Requerido.
   */
  host: configService.get<string>('POSTGRES_HOST'),
  /**
   * Puerto de la base de datos.
   * @env POSTGRES_PORT - Requerido.
   */
  port: configService.get<number>('POSTGRES_PORT'),
  /**
   * Nombre de usuario para la conexión a la base de datos.
   * @env POSTGRES_USERNAME - Requerido.
   */
  username: configService.get<string>('POSTGRES_USERNAME'),
  /**
   * Contraseña para la conexión a la base de datos.
   * @env POSTGRES_PASSWORD - Requerido.
   */
  password: configService.get<string>('POSTGRES_PASSWORD'),
  /**
   * Nombre de la base de datos a la que conectar.
   * @env POSTGRES_DATABASE - Requerido.
   */
  database: configService.get<string>('POSTGRES_DATABASE'),
  /**
   * Rutas a los archivos de entidad. TypeORM buscará entidades en estos directorios.
   * Utiliza `path.join` para construir rutas de forma segura entre sistemas operativos.
   * Busca archivos .entity.ts (desarrollo) y .entity.js (producción/compilado).
   */
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  /**
   * Rutas a los archivos de migración. TypeORM buscará migraciones en estos directorios.
   * Busca archivos .ts (desarrollo) y .js (producción/compilado) dentro de `src/database/migrations`.
   */
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  /**
   * Nombre de la tabla donde se registrará el historial de migraciones.
   */
  migrationsTableName: 'migrations',
  /**
   * Si es `true`, el esquema de la base de datos se crea automáticamente en cada conexión de la aplicación.
   * **ADVERTENCIA:** No usar en producción. Establecido a `false`.
   * Las migraciones deben usarse para gestionar cambios en el esquema.
   */
  synchronize: false,
  /**
   * Configuración de logging para TypeORM.
   * En producción, solo se registran errores.
   * En desarrollo, se registran errores, advertencias, migraciones y esquema.
   */
  logging: isProduction ? ['error'] : ['error', 'warn', 'migration', 'schema'],
  /**
   * Si es `true`, las migraciones pendientes se ejecutarán automáticamente al iniciar la conexión.
   * Generalmente se prefiere ejecutar migraciones explícitamente mediante la CLI.
   * Establecido a `false`.
   */
  migrationsRun: false,
  /**
   * Opciones de SSL para la conexión a la base de datos.
   * Habilitado en producción con `rejectUnauthorized: false` (esto puede ser necesario para algunos proveedores de nube como Heroku).
   * Considera una configuración más estricta si es posible.
   */
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  /**
   * Habilita el almacenamiento en caché de metadatos de TypeORM.
   * Habilitado solo en producción para mejorar el rendimiento.
   */
  cache: isProduction,
};

/**
 * Instancia de DataSource configurada con las opciones anteriores.
 * Esta instancia es la que se exporta y utiliza la CLI de TypeORM.
 */
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
