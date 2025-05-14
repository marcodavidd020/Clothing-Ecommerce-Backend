import { SetMetadata } from '@nestjs/common';
import { USER_TYPES_KEY } from '../../constants/settings';

/**
 * Decorador para especificar qué roles de usuario pueden acceder a un recurso
 *
 * Uso:
 * @UserTypes('admin', 'manager')
 * @UseGuards(JwtAuthGuard, UserTypesGuard)
 */
export const UserTypes = (...types: string[]) =>
  SetMetadata(USER_TYPES_KEY, types);
