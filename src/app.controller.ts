import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { SuccessSerializer } from './common/serializers/responses/success.serializer';
import { ErrorSerializer } from './common/serializers/responses/error.serializer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// DTO de ejemplo para mostrar la validación
class ExampleDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido' },
  )
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;
}

@ApiTags('Aplicación')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Obtener mensaje de bienvenida' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje obtenido exitosamente',
    type: SuccessSerializer,
  })
  @Get()
  getHello(): SuccessSerializer<{ message: string }> {
    const message = this.appService.getHello();

    // Usar el serializador de éxito para envolver la respuesta
    return new SuccessSerializer({
      message: 'Operación completada con éxito',
      data: { message },
    });
  }

  @ApiOperation({ summary: 'Ejemplo de manejo de errores' })
  @ApiResponse({
    status: 200,
    description: 'Operación exitosa',
    type: SuccessSerializer,
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la solicitud',
    type: ErrorSerializer,
  })
  @Post('example')
  postExample(@Body() dto: ExampleDto): SuccessSerializer<ExampleDto> {
    // Simulamos una validación manual o algún error de negocio
    if (dto.email === 'error@test.com') {
      throw new BadRequestException(
        new ErrorSerializer({
          statusCode: 400,
          message: 'Error de validación manual',
          errors: [
            {
              field: 'email',
              errors: ['Este correo electrónico no está permitido'],
              value: dto.email,
            },
          ],
        }),
      );
    }

    // Si todo está bien, devolvemos una respuesta exitosa
    return new SuccessSerializer({
      message: 'Datos procesados correctamente',
      data: dto,
    });
  }
}
