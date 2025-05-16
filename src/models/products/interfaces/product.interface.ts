import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import {
  IPaginatedResult,
  IPaginationOptions,
} from 'src/common/interfaces/pagination.interface';

export interface IProductsService {
  findAll(): Promise<Product[]>;
  findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<Product>>;
  findById(id: string): Promise<Product>;
  findBySlug(slug: string): Promise<Product | null>;
  create(productData: CreateProductDto): Promise<Product>;
  update(
    id: string,
    productData: UpdateProductDto,
  ): Promise<Product | null>;
  delete(id: string): Promise<void>;
}
