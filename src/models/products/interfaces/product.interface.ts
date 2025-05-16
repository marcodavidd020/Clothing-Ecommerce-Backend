import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductSerializer } from '../serializers/product.serializer';
import {
  IPaginatedResult,
  IPaginationOptions,
} from 'src/common/interfaces/pagination.interface';

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
}
