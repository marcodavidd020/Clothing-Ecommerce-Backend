import * as pg from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config as dotenvConfig } from 'dotenv';

// Cargar variables de entorno del archivo .env
dotenvConfig();

const asyncExec = promisify(exec);

// Configuración para la conexión a la base de datos
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DATABASE || 'ecommerce',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

async function resetDatabase() {
  console.log('Iniciando reset de base de datos...');
  console.log(`Conectando a: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  
  const client = new pg.Client(dbConfig);

  try {
    await client.connect();
    console.log(`Conectado a PostgreSQL (base de datos: ${dbConfig.database})`);

    // Verificar si es base de datos local o remota
    const isLocalDB = dbConfig.host === 'localhost' || dbConfig.host === '127.0.0.1';
    
    if (isLocalDB) {
      console.log('Detectada base de datos local - recreando completamente...');
      await recreateLocalDatabase();
    } else {
      console.log('Detectada base de datos remota - limpiando tablas...');
      await cleanRemoteDatabase(client);
    }

    await client.end();
    console.log('Desconectado de PostgreSQL.');

    // Ejecutar migraciones
    console.log('Ejecutando migraciones...');
    await asyncExec('npm run migration:run');

    // Ejecutar seeders
    console.log('Ejecutando seeders...');
    await asyncExec('npm run seed');

    console.log('¡Proceso completado exitosamente!');
  } catch (error) {
    console.error('Error al resetear la base de datos:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (!client['_ended']) {
      await client.end();
    }
  }
}

async function recreateLocalDatabase() {
  // Para bases de datos locales, usar la lógica original
  const maintenanceClient = new pg.Client({
    ...dbConfig,
    database: 'postgres' // Conectar a postgres para poder eliminar/crear la BD objetivo
  });

  try {
    await maintenanceClient.connect();
    console.log('Conectado a base de datos de mantenimiento');

    const targetDbName = dbConfig.database;

    // Cerrar conexiones activas
    console.log(`Cerrando conexiones a la base de datos '${targetDbName}'...`);
    await maintenanceClient.query(
      `SELECT pg_terminate_backend(pid) 
       FROM pg_stat_activity 
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [targetDbName]
    );

    // Eliminar y recrear la base de datos
    console.log(`Eliminando base de datos '${targetDbName}' si existe...`);
    await maintenanceClient.query(`DROP DATABASE IF EXISTS "${targetDbName}"`);

    console.log(`Creando nueva base de datos '${targetDbName}'...`);
    await maintenanceClient.query(`CREATE DATABASE "${targetDbName}"`);

    console.log('Base de datos local recreada correctamente');
  } finally {
    await maintenanceClient.end();
  }
}

async function cleanRemoteDatabase(client: pg.Client) {
  console.log('Limpiando base de datos remota...');
  
  try {
    // Obtener todas las tablas del esquema público
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'migrations'
      ORDER BY tablename
    `);

    console.log(`Encontradas ${tablesResult.rows.length} tablas para eliminar`);

    // Eliminar todas las tablas excepto migrations usando CASCADE para manejar dependencias
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Eliminando tabla: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }

    // Obtener y eliminar todos los ENUMs personalizados
    const enumsResult = await client.query(`
      SELECT typname as enum_name
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `);

    console.log(`Encontrados ${enumsResult.rows.length} ENUMs para eliminar`);

    for (const row of enumsResult.rows) {
      const enumName = row.enum_name;
      console.log(`Eliminando ENUM: ${enumName}`);
      await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
    }

    // Limpiar la tabla de migraciones para que se puedan ejecutar de nuevo
    const migrationTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      )
    `);

    if (migrationTableExists.rows[0].exists) {
      console.log('Limpiando tabla de migraciones...');
      await client.query('DELETE FROM migrations WHERE 1=1');
    }

    // Verificar que se limpiaron todas las tablas
    const remainingTablesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'migrations'
    `);

    const remainingCount = parseInt(remainingTablesResult.rows[0].count);
    console.log(`Tablas restantes (excluyendo migrations): ${remainingCount}`);

    console.log('Base de datos remota limpiada correctamente');
  } catch (error) {
    console.error('Error durante la limpieza:', error.message);
    throw error;
  }
}

resetDatabase();
