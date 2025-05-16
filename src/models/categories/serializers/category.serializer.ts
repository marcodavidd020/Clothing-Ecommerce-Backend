import { Exclude, Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';
import { ModelSerializer } from '../../common/serializers/model.serializer';

export class CategorySerializer extends ModelSerializer {
  @ApiProperty({
    example: 'f1a9e7c8-3b5d-4a6e-8f4c-1b5c0d7a9e8b',
    description: 'ID único de la categoría',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    example: 'Electrónicos',
    description: 'Nombre de la categoría',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'electronicos',
    description: 'Slug único de la categoría',
  })
  @Expose()
  slug: string;

  @Expose()
  image?: string | null;

  @Exclude() // Excluimos el padre para evitar referencias circulares por defecto
  parent: Category;

  @ApiProperty({
    type: () => CategorySerializer,
    isArray: true,
    description: 'Categorías hijas',
  })
  @Expose()
  @Type(() => CategorySerializer)
  children: CategorySerializer[];

  constructor(partial: Partial<Category>) {
    super(partial);
    Object.assign(this, partial);
  }
}
