import { IsNotEmpty, IsString, IsOptional, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de categorías
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electrónicos',
    description: 'Nombre de la categoría. Debe ser único.',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @ApiProperty({
    example: 'electronicos',
    description: 'Slug único para la categoría. Se utilizará en las URLs.',
    required: true,
  })
  @IsNotEmpty({ message: 'El slug no puede estar vacío.' })
  @IsString({ message: 'El slug debe ser una cadena de texto.' })
  slug: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen para la categoría',
    example: 'https://example.com/images/electronicos.jpg',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsUrl({}, { message: 'La imagen debe ser una URL válida.' })
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto.' })
  image?: string | null;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (opcional)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsString() // O IsUUID si los IDs son UUIDs
  parentId?: string;
}
