import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID del item de la orden que se está reseñando.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsNotEmpty({ message: 'El ID del item de la orden no puede estar vacío.' })
  @IsUUID('4', {
    message: 'El ID del item de la orden debe ser un UUID válido.',
  })
  orderItemId: string;

  @ApiProperty({
    description: 'Calificación otorgada, de 1 a 5.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'La calificación no puede estar vacía.' })
  @IsInt({ message: 'La calificación debe ser un número entero.' })
  @Min(1, { message: 'La calificación mínima es 1.' })
  @Max(5, { message: 'La calificación máxima es 5.' })
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentario adicional sobre el producto/item.',
    example: '¡Excelente producto, lo recomiendo!',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'El comentario debe ser una cadena de texto.' })
  @MaxLength(1000, {
    message: 'El comentario no puede exceder los 1000 caracteres.',
  })
  comment?: string | null;
}
