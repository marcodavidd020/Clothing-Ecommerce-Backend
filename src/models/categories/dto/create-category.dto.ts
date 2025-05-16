import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la creación de categorías
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: 'Electrónicos',
    description: 'Nombre de la categoría. Debe ser único.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'electronicos',
    description: 'Slug único para la categoría. Se utilizará en las URLs.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  slug: string;
}
