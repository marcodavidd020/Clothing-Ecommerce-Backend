import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenSerializer } from './serializers/token.serializer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserSerializer } from '../models/users/serializers/user.serializer';
import { LoggedInUser } from '../common/decorators/requests/logged-in-user.decorator';
import { IJwtUser } from './interfaces/jwt-user.interface';
import { createSuccessResponse } from '../common/helpers/responses/success.helper';
import { createUnauthorizedResponse } from '../common/helpers/responses/error.helper';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Autenticación')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Obtiene un token JWT a partir de credenciales válidas',
  })
  @ApiResponse({
    status: 201,
    description: 'Login exitoso',
    type: TokenSerializer,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      const user = await this.authService.validateUser(loginDto);
      const token = await this.authService.login(user);
      return createSuccessResponse(token, 'Inicio de sesión exitoso');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(
        createUnauthorizedResponse(
          'Credenciales incorrectas. Por favor, verifique su email y contraseña.',
        ),
      );
    }
  }

  @ApiOperation({
    summary: 'Obtener perfil de usuario',
    description: 'Obtiene el perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil recuperado con éxito',
    type: UserSerializer,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@LoggedInUser() user: IJwtUser): Promise<any> {
    try {
      // Obtenemos los datos del usuario a partir del ID en el token JWT
      const profile = await this.authService.getProfile(user.id);
      return createSuccessResponse(
        profile,
        'Perfil recuperado exitosamente',
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        createUnauthorizedResponse('No autorizado'),
      );
    }
  }

  @ApiOperation({
    summary: 'Renovar token',
    description:
      'Renovar tokens usando un refresh token (no requiere autenticación)',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado con éxito',
    type: TokenSerializer,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const tokens = await this.authService.refreshTokens(
        refreshTokenDto.refreshToken,
      );
      return createSuccessResponse(tokens, 'Tokens renovados exitosamente');
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        createUnauthorizedResponse(
          'Error al renovar los tokens. Refresh token inválido o expirado.',
        ),
      );
    }
  }
}
