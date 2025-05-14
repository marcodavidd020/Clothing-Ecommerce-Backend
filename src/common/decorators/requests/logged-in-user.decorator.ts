import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../../constants/settings';

/**
 * Decorador para obtener el usuario actual del request
 *
 * Uso:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@LoggedInUser() user) { ... }
 *
 * También se puede especificar una propiedad específica del usuario:
 * getUser(@LoggedInUser('id') userId) { ... }
 */
export const LoggedInUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad, devolver solo esa propiedad
    return data ? user?.[data] : user;
  },
);
