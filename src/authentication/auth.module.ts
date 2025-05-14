import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../models/users/users.module';
import { RolesModule } from '../models/roles/roles.module';
import { PermissionsModule } from '../models/permissions/permissions.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { JwtConfigModule } from '../config/auth/jwt/config.module';
import { JwtConfigService } from '../config/auth/jwt/config.service';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PermissionsModule,
    PassportModule,
    JwtConfigModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      useFactory: async (jwtConfigService: JwtConfigService) => ({
        secret: jwtConfigService.getJwtSecret(),
        signOptions: {
          expiresIn: jwtConfigService.getJwtExpiresIn(),
        },
      }),
      inject: [JwtConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
