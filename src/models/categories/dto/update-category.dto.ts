import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la actualización de categorías
 */
export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Electrónicos',
    description: 'Nombre de la categoría',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'electronicos',
    description: 'Slug único para la categoría',
  })
  @IsOptional()
  @IsString()
  slug?: string;
}
