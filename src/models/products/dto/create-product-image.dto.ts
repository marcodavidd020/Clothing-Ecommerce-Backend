import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'URL de la imagen del producto',
    example: 'https://example.com/images/product1-detail.jpg',
  })
  @IsNotEmpty({ message: 'La URL no puede estar vacía' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsString({ message: 'La URL debe ser una cadena de texto' })
  url: string;

  @ApiPropertyOptional({
    description: 'Texto alternativo para la imagen (para accesibilidad)',
    example: 'Vista frontal del Smartphone XYZ en color rojo',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El texto alternativo debe ser una cadena de texto' })
  alt?: string | null;
}
