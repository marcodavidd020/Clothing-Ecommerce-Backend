import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SearchDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: 'Término de búsqueda (buscará en campos relevantes)',
    example: 'marco',
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto' })
  q?: string;
}
