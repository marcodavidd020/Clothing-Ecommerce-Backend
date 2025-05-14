import * as bcrypt from 'bcrypt';
import { User } from '../../../models/users/entities/user.entity';
import { DeepPartial } from 'typeorm';

export class UserFactory {
  /**
   * Lista de nombres de ejemplo para generar usuarios más realistas
   */
  private static firstNames = [
    'Ana',
    'Carlos',
    'María',
    'Juan',
    'Sofía',
    'Luis',
    'Laura',
    'Miguel',
    'Paula',
    'David',
    'Elena',
    'Javier',
    'Carmen',
    'Pablo',
  ];

  /**
   * Lista de apellidos de ejemplo
   */
  private static lastNames = [
    'García',
    'López',
    'Martínez',
    'Rodríguez',
    'Sánchez',
    'Pérez',
    'González',
    'Gómez',
    'Fernández',
    'Ruiz',
    'Díaz',
    'Torres',
    'Moreno',
    'Ortega',
    'Silva',
  ];

  /**
   * Generar un usuario aleatorio
   */
  static generate(overrideParams: Partial<User> = {}): DeepPartial<User> {
    const randomFirstName = this.getRandomElement(this.firstNames);
    const randomLastName = this.getRandomElement(this.lastNames);

    const email =
      overrideParams.email ||
      `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
    const firstName = overrideParams.firstName || randomFirstName;
    const lastName = overrideParams.lastName || randomLastName;
    const password = bcrypt.hashSync(overrideParams.password || 'password', 10);

    return {
      id: overrideParams.id, // Permitir ID fijo para tests
      email,
      firstName,
      lastName,
      password,
      isActive:
        overrideParams.isActive !== undefined ? overrideParams.isActive : true,
      avatar: overrideParams.avatar || undefined,
      roles: overrideParams.roles || ['user'],
      phoneNumber: overrideParams.phoneNumber || this.generateRandomPhone(),
    };
  }

  /**
   * Generar múltiples usuarios
   */
  static generateMany(
    count: number,
    baseOverrides: Partial<User> = {},
  ): DeepPartial<User>[] {
    return Array(count)
      .fill(null)
      .map((_, index) =>
        this.generate({
          ...baseOverrides,
          email:
            baseOverrides.email || `user_${Date.now()}_${index}@example.com`,
        }),
      );
  }

  /**
   * Genera un número de teléfono aleatorio con formato español
   */
  private static generateRandomPhone(): string {
    const prefixes = ['6', '7', '9'];
    const prefix = this.getRandomElement(prefixes);
    const number = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `${prefix}${number}`;
  }

  /**
   * Obtiene un elemento aleatorio de un array
   */
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
