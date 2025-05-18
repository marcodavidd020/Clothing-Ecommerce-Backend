import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Nueva calificación otorgada, de 1 a 5.',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'La calificación debe ser un número entero.' })
  @Min(1, { message: 'La calificación mínima es 1.' })
  @Max(5, { message: 'La calificación máxima es 5.' })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Nuevo comentario sobre el producto/item.',
    example: 'El producto es bueno, pero podría mejorar.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'El comentario debe ser una cadena de texto.' })
  @MaxLength(1000, {
    message: 'El comentario no puede exceder los 1000 caracteres.',
  })
  comment?: string | null;

  @ApiPropertyOptional({
    description:
      'Estado de actividad de la reseña (para soft delete por admin).',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado de actividad debe ser un valor booleano.' })
  isActive?: boolean;
}
