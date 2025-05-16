import { Address } from '../../../models/addresses/entities/address.entity';
import { User } from '../../../models/users/entities/user.entity';
import { DeepPartial } from 'typeorm';

export class AddressFactory {
  /**
   * Lista de calles de ejemplo
   */
  private static streets = [
    'Calle Mayor',
    'Avenida de la Constitución',
    'Gran Vía',
    'Paseo de la Castellana',
    'Calle Alcalá',
    'Rambla Catalunya',
    'Avenida Diagonal',
    'Calle Serrano',
    'Paseo del Prado',
  ];

  /**
   * Lista de ciudades de ejemplo
   */
  private static cities = [
    'Madrid',
    'Barcelona',
    'Valencia',
    'Sevilla',
    'Zaragoza',
    'Málaga',
    'Bilbao',
    'Alicante',
    'Córdoba',
    'Valladolid',
  ];

  /**
   * Lista de provincias
   */
  private static states = [
    'Madrid',
    'Barcelona',
    'Valencia',
    'Sevilla',
    'Zaragoza',
    'Málaga',
    'Vizcaya',
    'Alicante',
    'Córdoba',
    'Valladolid',
  ];

  /**
   * Generar una dirección aleatoria
   */
  static generate(overrideParams: Partial<Address> = {}): DeepPartial<Address> {
    const city = overrideParams.city || this.getRandomElement(this.cities);
    const department = overrideParams.department || this.getStateForCity(city);

    return {
      id: overrideParams.id, // Permitir ID fijo para tests
      street:
        overrideParams.street ||
        `${this.getRandomElement(this.streets)}, ${Math.floor(Math.random() * 100)}`,
      city,
      department,
      postalCode: overrideParams.postalCode || this.generatePostalCode(),
      isDefault:
        overrideParams.isDefault !== undefined
          ? overrideParams.isDefault
          : false,
      user: overrideParams.user || undefined,
    };
  }

  /**
   * Generar múltiples direcciones
   */
  static generateMany(
    count: number,
    baseOverrides: Partial<Address> = {},
  ): DeepPartial<Address>[] {
    return Array(count)
      .fill(null)
      .map(() =>
        this.generate({
          ...baseOverrides,
        }),
      );
  }

  /**
   * Genera un código postal aleatorio
   */
  private static generatePostalCode(): string {
    return Math.floor(Math.random() * 90000 + 10000).toString();
  }

  /**
   * Obtiene un elemento aleatorio de un array
   */
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Obtiene la provincia correspondiente a una ciudad
   */
  private static getStateForCity(city: string): string {
    const cityIndex = this.cities.indexOf(city);
    if (cityIndex !== -1) {
      return this.states[cityIndex];
    }
    return this.getRandomElement(this.states);
  }
}
