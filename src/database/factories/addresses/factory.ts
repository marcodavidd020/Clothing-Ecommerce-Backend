import { DeepPartial } from 'typeorm';
import { Address } from '../../../models/addresses/entities/address.entity';

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
  private static departments = [
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
   * Lista de full names de la dirección
   */
  private static fullNames = [
    'Av.Bolivia, Calle 8',
    'Av.Bolivia, Calle 9',
    'Av.Bolivia, Calle 10',
    'Av.Bolivia, Calle 11',
    'Av.Bolivia, Calle 12',
  ];

  /**
   * Lista de números de phoneNumber de la dirección
   */
  private static phoneNumbers = [
    '1234567890',
    '0987654321',
    '1122334455',
    '1234567890',
    '0987654321',
    '1122334455',
    '1234567890',
    '0987654321',
    '1122334455',
  ];

  /**
   * Lista de latitudes de la dirección
   */
  private static latitude = [
    -16.5,
    -16.6,
    -16.7,
    -16.8,
    -16.9,
  ];

  /**
   * Lista de longitudes de la dirección
   */
  private static longitude = [
    -68.1,
    -68.2,
    -68.3,
    -68.4,
    -68.5,
  ];

  /**
   * Generar una dirección aleatoria
   */
  static generate(overrideParams: Partial<Address> = {}): DeepPartial<Address> {
    const city = overrideParams.city || this.getRandomElement(this.cities);
    const department = overrideParams.department || this.getStateForCity(city);
    const phoneNumber =
      overrideParams.phoneNumber ||
      this.getRandomElement(this.phoneNumbers);
    const latitude =
      overrideParams.latitude ||
      this.getRandomElement(this.latitude);
    const longitude =
      overrideParams.longitude ||
      this.getRandomElement(this.longitude);

    return {
      id: overrideParams.id, // Permitir ID fijo para tests
      fullName:
        overrideParams.fullName || `${this.getRandomElement(this.fullNames)}`,
      street:
        overrideParams.street ||
        `${this.getRandomElement(this.streets)}, ${Math.floor(Math.random() * 100)}`,
      city,
      phoneNumber,
      latitude,
      longitude,
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
      return this.departments[cityIndex];
    }
    return this.getRandomElement(this.departments);
  }
}
