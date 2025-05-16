import * as pg from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExec = promisify(exec);

// Configuración para la conexión inicial (a una BD de mantenimiento)
const initialDbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DATABASE || 'postgres', // Conectar a la BD 'postgres' o 'template1'
};

// Nombre de la base de datos a recrear
const targetDbName = 'ecommerce';

async function resetDatabase() {
  console.log('Iniciando reset de base de datos...');
  // Usar initialDbConfig para la conexión inicial
  const client = new pg.Client(initialDbConfig);

  try {
    await client.connect();
    console.log(
      `Conectado a PostgreSQL (base de datos: ${initialDbConfig.database})`,
    );

    // Cerrar conexiones activas a la base de datos objetivo
    console.log(`Cerrando conexiones a la base de datos '${targetDbName}'...`);
    await client.query(
      `
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = $1 
      AND pid <> pg_backend_pid()
    `,
      [targetDbName],
    ); // Usar parámetros para evitar inyección SQL

    // Eliminar la base de datos si existe
    console.log(`Eliminando base de datos '${targetDbName}' si existe...`);
    await client.query(`DROP DATABASE IF EXISTS ${targetDbName}`); // No se necesita parametrizar aquí, el nombre de la BD es fijo

    // Crear nueva base de datos
    console.log(`Creando nueva base de datos '${targetDbName}'...`);
    await client.query(`CREATE DATABASE ${targetDbName}`);

    console.log('Base de datos recreada correctamente');

    // Ya no necesitamos el cliente pg para ejecutar migraciones y seeders
    await client.end();
    console.log('Desconectado de PostgreSQL.');

    // Ejecutar migraciones (ahora se conectarán a la BD 'ecommerce' recién creada)
    console.log('Ejecutando migraciones...');
    await asyncExec('npm run migration:run');

    // Ejecutar seeders
    console.log('Ejecutando seeders...');
    await asyncExec('npm run seed');

    console.log('¡Proceso completado exitosamente!');
  } catch (error) {
    console.error('Error al resetear la base de datos:', error);
  } finally {
    // Asegurarse de que el cliente se cierre si aún está conectado
    if (!client['_ended']) {
      // Verificar si el cliente no se ha cerrado ya
      await client.end();
    }
  }
}

resetDatabase();
