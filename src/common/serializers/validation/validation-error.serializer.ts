import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ErrorSerializer, FieldError } from '../responses/error.serializer';

/**
 * Serializador para errores de validación
 */
@Exclude()
export class ValidationErrorSerializer extends ErrorSerializer {
  @ApiProperty({
    type: 'array',
    description: 'Lista de errores de validación',
    example: [
      {
        field: 'email',
        errors: ['El formato de email no es válido'],
        value: 'correo-invalido',
      },
    ],
  })
  @Expose()
  declare errors: FieldError[];

  constructor(partial: Partial<ValidationErrorSerializer>) {
    super({
      statusCode: 400,
      message: partial.message || 'Error de validación',
      errors: partial.errors || [],
    });
  }
}
