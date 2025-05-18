import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsBoolean, IsArray, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description:
      'Si es true, elimina todas las relaciones con categorías existentes antes de establecer las nuevas',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replaceCategories?: boolean;

  @ApiPropertyOptional({
    description:
      'Si es true, elimina todas las variantes existentes antes de agregar las nuevas',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replaceVariants?: boolean;

  @ApiPropertyOptional({
    description:
      'Si es true, elimina todas las imágenes existentes antes de agregar las nuevas',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replaceImages?: boolean;

  // Aseguramos que categoryIds sea array o indefinido, no null
  @ValidateIf((o) => o.categoryIds !== undefined)
  @IsArray()
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo o no.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
