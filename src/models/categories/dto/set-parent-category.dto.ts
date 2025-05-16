import { IsUUID, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SetParentCategoryDto {
  @ApiPropertyOptional({
    description:
      'ID de la nueva categoría padre. Enviar null o no enviar la propiedad para mover a la raíz (desasignar padre).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    nullable: true, // Indica que null es un valor permitido
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null) // Validar con IsUUID solo si no es null
  @IsUUID('4')
  parentId?: string | null;
}
