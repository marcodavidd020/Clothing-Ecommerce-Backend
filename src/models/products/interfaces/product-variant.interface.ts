import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductVariantSerializer } from '../serializers/product-variant.serializer';

export interface IProductVariantsService {
  findByProductId(productId: string): Promise<ProductVariantSerializer[]>;
  findById(id: string): Promise<ProductVariantSerializer>;
  create(
    variantData: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer>;
  update(
    id: string,
    variantData: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer>;
  delete(id: string): Promise<void>;
}
