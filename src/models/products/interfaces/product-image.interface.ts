import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { UpdateProductImageDto } from '../dto/update-product-image.dto';
import { ProductImageSerializer } from '../serializers/product-image.serializer';

export interface IProductImagesService {
  findByProductId(productId: string): Promise<ProductImageSerializer[]>;
  findById(id: string): Promise<ProductImageSerializer>;
  create(
    imageData: CreateProductImageDto & { productId: string },
  ): Promise<ProductImageSerializer>;
  update(
    id: string,
    imageData: UpdateProductImageDto,
  ): Promise<ProductImageSerializer>;
  delete(id: string): Promise<void>;
}
