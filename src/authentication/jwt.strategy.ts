import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../models/users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtConfigService } from '../config/auth/jwt/config.service';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigService.getJwtSecret(),
    });
  }

  async validate(payload: IJwtPayload) {
    const { sub: userId } = payload;
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    // El objeto de usuario se adjuntará al objeto Request
    // como req.user automáticamente por Passport
    return {
      id: user.id,
      email: user.email,
      roles: payload.roles,
      // Usando el método real de verificación de permisos
      hasPermission: async (permissionName: string) => {
        return await this.authService.userHasPermission(
          user.id,
          permissionName,
        );
      },
    };
  }
}
