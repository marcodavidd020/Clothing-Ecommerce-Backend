import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductVariantSerializer } from '../serializers/product-variant.serializer';
import { AddVariantStockDto } from '../dto/add-variant-stock.dto';
import { RemoveVariantStockDto } from '../dto/remove-variant-stock.dto';
import { UpdateVariantDetailsDto } from '../dto/update-variant-details.dto';

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

  // Nuevos métodos
  addStock(
    variantId: string,
    dto: AddVariantStockDto,
  ): Promise<ProductVariantSerializer>;
  removeStock(
    variantId: string,
    dto: RemoveVariantStockDto,
  ): Promise<ProductVariantSerializer>;
  updateDetails(
    variantId: string,
    dto: UpdateVariantDetailsDto,
  ): Promise<ProductVariantSerializer>;
}
