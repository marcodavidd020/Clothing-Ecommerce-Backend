import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import { ProductSerializer } from '../serializers/product.serializer';
import {
  IPaginatedResult,
  IPaginationOptions,
} from 'src/common/interfaces/pagination.interface';
import { ApplyDiscountPercentageDto } from '../dto/apply-discount-percentage.dto';
import { ApplyFixedDiscountDto } from '../dto/apply-fixed-discount.dto';
import { ChangeProductStockDto } from '../dto/change-product-stock.dto';

export interface IProductsService {
  findAll(): Promise<ProductSerializer[]>;
  findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ProductSerializer>>;
  findById(id: string): Promise<ProductSerializer>;
  findBySlug(slug: string): Promise<ProductSerializer | null>;
  create(productData: CreateProductDto): Promise<ProductSerializer>;
  update(
    id: string,
    productData: UpdateProductDto,
  ): Promise<ProductSerializer | null>;
  delete(id: string): Promise<void>;
  applyDiscountPercentage(
    productId: string,
    dto: ApplyDiscountPercentageDto,
  ): Promise<ProductSerializer>;
  applyFixedDiscount(
    productId: string,
    dto: ApplyFixedDiscountDto,
  ): Promise<ProductSerializer>;
  removeDiscount(productId: string): Promise<ProductSerializer>;
  changeStock(
    productId: string,
    dto: ChangeProductStockDto,
  ): Promise<ProductSerializer>;
}
