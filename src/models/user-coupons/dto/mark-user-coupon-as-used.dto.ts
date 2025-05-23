import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

// Este DTO es principalmente para la documentación de Swagger si el endpoint
// no requiere un cuerpo pero la acción modifica el recurso.
// Si se quisiera permitir especificar la fecha de uso desde el body, se añadiría aquí.
export class MarkUserCouponAsUsedDto {
  @ApiPropertyOptional({
    description:
      'Fecha específica en que se usó el cupón. Si no se provee, se usa la fecha actual.',
    type: Date,
    example: '2024-07-15T10:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  usedAt?: Date;
}
