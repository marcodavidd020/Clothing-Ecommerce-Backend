import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Interfaz para errores de campo
 */
export interface FieldError {
  field: string;
  errors: string[];
  value: any;
}

/**
 * Serializador para respuestas de error
 */
@Exclude()
export class ErrorSerializer {
  @ApiProperty({ example: false, description: 'Indicador de éxito' })
  @Expose()
  success: boolean = false;

  @ApiProperty({
    example: 'Ha ocurrido un error',
    description: 'Mensaje descriptivo del error',
  })
  @Expose()
  message: string;

  @ApiProperty({
    example: 400,
    description: 'Código de estado HTTP',
  })
  @Expose()
  statusCode: number;

  @ApiProperty({
    type: 'array',
    description: 'Lista de errores detallados',
    example: [
      {
        field: 'email',
        errors: ['El email ya está en uso'],
        value: 'test@example.com',
      },
    ],
  })
  @Expose()
  errors: FieldError[] = [];

  @ApiProperty({
    example: '2025-05-04T06:36:05.896Z',
    description: 'Marca de tiempo del error',
  })
  @Expose()
  timestamp: string;

  constructor(partial: Partial<ErrorSerializer>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}
