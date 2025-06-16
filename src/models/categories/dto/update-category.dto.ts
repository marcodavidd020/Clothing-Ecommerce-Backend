import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO para la actualización de categorías
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
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

  @ApiPropertyOptional({
    description: 'URL de la imagen para la categoría',
    example: 'https://example.com/images/electronicos_actualizada.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsUrl(
    {},
    { message: 'La imagen debe ser una URL válida si se proporciona.' },
  )
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto.' })
  image?: string | null;
}
