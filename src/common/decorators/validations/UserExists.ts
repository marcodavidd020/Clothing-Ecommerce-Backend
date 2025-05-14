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
 * Constraint para validar que un usuario existe
 */
@ValidatorConstraint({ async: true })
@Injectable()
export class UserExistsConstraint implements ValidatorConstraintInterface {
  private readonly logger = new Logger(UserExistsConstraint.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async validate(userId: string, args: ValidationArguments) {
    if (!userId) return false;

    try {
      const user = await this.usersService.findById(userId);
      return !!user;
    } catch (e) {
      this.logger.error(
        `Error validando existencia de usuario: ${e.message}`,
        e.stack,
      );
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `El usuario con ID "${args.value}" no existe`;
  }
}

/**
 * Decorador para validar que un usuario existe
 *
 * Uso:
 * class CreateItemDto {
 *   @UserExists()
 *   userId: string;
 * }
 */
export function UserExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UserExistsConstraint,
    });
  };
}
