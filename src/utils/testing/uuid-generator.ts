/**
 * Generador de UUIDs predecibles para pruebas
 *
 * Permite crear UUIDs que siguen un patrón predecible
 * para hacer más fácil el testing y los fixtures.
 */
export class TestUuidGenerator {
  private static counter = 1;

  /**
   * Genera un UUID predecible basado en un contador
   * Formato: 00000000-0000-0000-0000-xxxxxxxxxxxx
   * donde x es un número incremental con padding
   */
  static generate(): string {
    const paddedCounter = String(this.counter++).padStart(12, '0');
    return `00000000-0000-0000-0000-${paddedCounter}`;
  }

  /**
   * Genera un UUID predecible basado en un prefijo y un contador
   * Útil para crear relaciones predecibles en tests
   */
  static generateWithPrefix(prefix: string): string {
    const paddedCounter = String(this.counter++).padStart(4, '0');
    const paddedPrefix = prefix.substring(0, 8).padEnd(8, '0');
    return `${paddedPrefix}-0000-0000-0000-${paddedCounter.padStart(12, '0')}`;
  }

  /**
   * Reinicia el contador (útil entre suites de test)
   */
  static reset(): void {
    this.counter = 1;
  }
}
