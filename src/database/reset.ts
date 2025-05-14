import * as pg from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExec = promisify(exec);

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'ecommerce', // Conectamos a la BD por defecto
};

// Nombre de la base de datos a recrear
const targetDbName = 'ecommerce';

async function resetDatabase() {
  console.log('Iniciando reset de base de datos...');
  const client = new pg.Client(dbConfig);

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL');

    // Cerrar conexiones activas
    console.log('Cerrando conexiones a la base de datos...');
    await client.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = '${targetDbName}' 
      AND pid <> pg_backend_pid()
    `);

    // Eliminar la base de datos si existe
    console.log('Eliminando base de datos si existe...');
    await client.query(`DROP DATABASE IF EXISTS ${targetDbName}`);

    // Crear nueva base de datos
    console.log('Creando nueva base de datos...');
    await client.query(`CREATE DATABASE ${targetDbName}`);

    console.log('Base de datos recreada correctamente');

    // Ejecutar migraciones
    console.log('Ejecutando migraciones...');
    await asyncExec('npm run migration:run');

    // Ejecutar seeders
    console.log('Ejecutando seeders...');
    await asyncExec('npm run seed');

    console.log('¡Proceso completado exitosamente!');
  } catch (error) {
    console.error('Error al resetear la base de datos:', error);
  } finally {
    await client.end();
  }
}

resetDatabase();
