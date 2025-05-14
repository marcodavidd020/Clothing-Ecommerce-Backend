import { DataSource } from 'typeorm';

/**
 * Interfaz para todos los seeders del sistema
 *
 * Esta interfaz define el contrato que todos los seeders deben implementar
 */
export interface Seeder {
  /**
   * Ejecuta el seeder
   * @param dataSource Fuente de datos (conexión) para ejecutar operaciones
   */
  run(dataSource: DataSource): Promise<void>;
}
