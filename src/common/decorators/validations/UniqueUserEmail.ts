import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { UsersService } from '../../../models/users/users.service';

/**
 * Constraint para validar que un email de usuario es único
 */
@ValidatorConstraint({ async: true })
@Injectable()
export class UniqueUserEmailConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger(UniqueUserEmailConstraint.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async validate(email: string, args: ValidationArguments) {
    if (!email) return true; // Si no hay email, dejamos que otros validadores se encarguen

    try {
      const user = await this.usersService.findByEmail(email);
      return !user; // Email es único si no existe usuario con ese email
    } catch (e) {
      // Registramos el error para ayudar en debugging
      this.logger.error(`Error validando email único: ${e.message}`, e.stack);
      return true; // En caso de error, permitimos continuar (otros validadores pueden detectar problemas)
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `El email "${args.value}" ya está en uso`;
  }
}

/**
 * Decorador para validar que un email de usuario es único
 *
 * Uso:
 * class CreateUserDto {
 *   @UniqueUserEmail()
 *   email: string;
 * }
 */
export function UniqueUserEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueUserEmailConstraint,
    });
  };
}
