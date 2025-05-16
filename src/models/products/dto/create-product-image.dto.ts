import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'ID del producto al que pertenece esta imagen',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productId: string;

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
